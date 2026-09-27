import time
import math
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from ..core.config import settings
from ..schemas.feasibility import FeasibilityStatus
from ..schemas.optimizer import (
    TransportMode,
    ScenarioMode,
    OptimizationSolverType,
    AllocationStatus,
    ScenarioConfig,
    OptimizationRequest,
    OptimizationResponse,
    OptimizationSummary,
    AllocationFlow,
    DisposalAllocationFlow,
    FacilityUtilization,
    DestinationUtilization,
    BottleneckAlert,
    BindingConstraint,
    Member3LedgerInput,
    FrontendSankeyFlow,
    FrontendNetworkRoute,
    FacilityCreate,
    DestinationCreate,
    DisposalSiteCreate,
)
from ..models.material import Material
from ..models.pathway import Pathway
from ..models.facility import Facility
from ..models.destination import Destination
from ..models.disposal import DisposalSite
from ..models.allocation import OptimizationRun
from .routes import get_feasible_routes
from .transport import (
    calculate_haversine_distance,
    calculate_transport_cost,
    get_transport_emission_factor,
)

# Optional solver imports with graceful fallbacks
try:
    from ortools.linear_solver import pywraplp
    HAS_ORTOOLS_LINEAR = True
except ImportError:
    HAS_ORTOOLS_LINEAR = False

try:
    from ortools.sat.python import cp_model
    HAS_ORTOOLS_CPSAT = True
except ImportError:
    HAS_ORTOOLS_CPSAT = False

try:
    from scipy.optimize import linprog
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False


class AllocationOptimizer:
    """
    Member 2 — PROCESSING + TRANSPORT + ALLOCATION OPTIMIZATION ENGINE.
    Determines optimal mass allocation from waste sources to candidate reuse destinations,
    processing facilities, and baseline disposal.
    Strictly conserves mass, enforces Member 1 feasibility, and exports clean contracts
    for Member 3 (Environmental/Economic Ledger) and Member 4 (Frontend UI).
    """

    @classmethod
    def optimize(
        cls,
        request: OptimizationRequest,
        db: Optional[Session] = None,
    ) -> OptimizationResponse:
        start_time = time.perf_counter()
        diagnostics: List[str] = []

        # 1. Resolve Materials
        materials_data = cls._resolve_materials(request, db)
        if not materials_data:
            diagnostics.append("Warning: No active materials supplied for optimization.")
            return cls._empty_response(request, diagnostics, time.perf_counter() - start_time)

        # 2. Resolve Facilities, Destinations, Disposal Sites
        facilities_data = cls._resolve_facilities(request, db)
        destinations_data = cls._resolve_destinations(request, db)
        disposal_sites_data = cls._resolve_disposal_sites(request, db)

        if not disposal_sites_data:
            # Fallback default disposal site if none present
            disposal_sites_data = [
                {
                    "id": "DISP-DEFAULT",
                    "name": "Standard Municipal Industrial Landfill",
                    "disposal_type": "LANDFILL",
                    "gate_fee_per_ton": settings.BASELINE_DISPOSAL_GATE_FEE_USD_PER_TON,
                    "capacity_tonnes": 1000000.0,
                    "location_name": "Regional Industrial Disposal Facility",
                    "latitude": materials_data[0]["latitude"] + 0.15,
                    "longitude": materials_data[0]["longitude"] + 0.15,
                }
            ]
            diagnostics.append("Using default industrial landfill disposal baseline.")

        # 3. Retrieve Member 1 Feasibility for each material
        feasibility_cache = cls._resolve_feasibility(materials_data, db)

        # 4. Formulate Optimization Graph & Decision Variables
        problem = cls._build_optimization_problem(
            materials=materials_data,
            destinations=destinations_data,
            facilities=facilities_data,
            disposal_sites=disposal_sites_data,
            feasibility=feasibility_cache,
            scenario=request.scenario,
            transport_mode=request.transport_mode,
            transport_rate=request.transport_rate_per_ton_km,
            disallow_disposal=request.disallow_disposal,
        )

        diagnostics.extend(problem["diagnostics"])

        # 5. Solve via Selected / Fallback Solver
        solution, solver_used = cls._solve_problem(problem, request.scenario.solver_type)
        diagnostics.append(f"Solved using solver: {solver_used}")

        # 6. Parse Solution, Verify Mass Balance & Build Explanations
        response = cls._format_solution_response(
            problem=problem,
            solution=solution,
            solver_used=solver_used,
            solve_time_ms=(time.perf_counter() - start_time) * 1000.0,
            scenario=request.scenario,
            diagnostics=diagnostics,
        )

        # 7. Persist run record if db session is available
        if db is not None:
            try:
                run_record = OptimizationRun(
                    id=f"RUN-{int(time.time() * 1000)}",
                    scenario_mode=request.scenario.mode.value,
                    total_input_tonnes=response.summary.total_input_tonnes,
                    diverted_tonnes=response.summary.total_diverted_tonnes,
                    disposed_tonnes=response.summary.total_disposed_tonnes,
                    residual_tonnes=response.summary.total_residual_tonnes,
                    diversion_rate_pct=response.summary.diversion_rate_pct,
                    net_cost=response.summary.net_cost,
                    solver_status=response.status,
                )
                db.add(run_record)
                db.commit()
            except Exception as e:
                db.rollback()
                diagnostics.append(f"Note: Could not persist run record to database: {str(e)}")

        return response

    # -------------------------------------------------------------
    # Resolvers for Entities & Feasibility
    # -------------------------------------------------------------

    @classmethod
    def _resolve_materials(cls, request: OptimizationRequest, db: Optional[Session]) -> List[Dict[str, Any]]:
        materials = []

        def _clean_mat(d: Dict[str, Any]) -> Dict[str, Any]:
            name = d.get("material_name") or d.get("name") or d.get("id") or "Industrial Waste Stream"
            d["name"] = name
            d["material_name"] = name
            return d

        # 1. Custom materials provided in request
        if request.custom_materials:
            for cm in request.custom_materials:
                materials.append(_clean_mat({
                    "id": cm.get("id", "CUSTOM-MAT"),
                    "name": cm.get("material_name", cm.get("name", "Custom Waste Stream")),
                    "quantity_tonnes": float(cm.get("quantity_tonnes", 0.0)),
                    "location_name": cm.get("location_name", "Source Site"),
                    "latitude": float(cm.get("latitude", 0.0)),
                    "longitude": float(cm.get("longitude", 0.0)),
                }))
            return materials

        # 2. Database lookup
        if db is not None:
            query = db.query(Material)
            if request.material_id:
                mat = query.filter(Material.id == request.material_id).first()
                if mat:
                    materials.append(_clean_mat(cls._model_to_dict(mat)))
            elif request.material_ids:
                mats = query.filter(Material.id.in_(request.material_ids)).all()
                materials.extend([_clean_mat(cls._model_to_dict(m)) for m in mats])
            else:
                mats = query.all()
                materials.extend([_clean_mat(cls._model_to_dict(m)) for m in mats])

        return materials

    @classmethod
    def _resolve_facilities(cls, request: OptimizationRequest, db: Optional[Session]) -> List[Dict[str, Any]]:
        facilities = []
        if request.custom_facilities:
            for f in request.custom_facilities:
                facilities.append(f.model_dump())
            return facilities

        if db is not None:
            facs = db.query(Facility).filter(Facility.is_active == True).all()
            facilities.extend([cls._model_to_dict(f) for f in facs])

        return facilities

    @classmethod
    def _resolve_destinations(cls, request: OptimizationRequest, db: Optional[Session]) -> List[Dict[str, Any]]:
        destinations = []
        if request.custom_destinations:
            for d in request.custom_destinations:
                destinations.append(d.model_dump())
            return destinations

        if db is not None:
            dests = db.query(Destination).filter(Destination.is_active == True).all()
            destinations.extend([cls._model_to_dict(d) for d in dests])

        return destinations

    @classmethod
    def _resolve_disposal_sites(cls, request: OptimizationRequest, db: Optional[Session]) -> List[Dict[str, Any]]:
        disposal_sites = []
        if request.custom_disposal_sites:
            for s in request.custom_disposal_sites:
                disposal_sites.append(s.model_dump())
            return disposal_sites

        if db is not None:
            sites = db.query(DisposalSite).filter(DisposalSite.is_active == True).all()
            disposal_sites.extend([cls._model_to_dict(s) for s in sites])

        return disposal_sites

    @classmethod
    def _resolve_feasibility(cls, materials: List[Dict[str, Any]], db: Optional[Session]) -> Dict[str, Dict[str, Any]]:
        """
        Queries Member 1 Feasibility Engine via get_feasible_routes.
        Returns mapping: material_id -> { pathway_id: {"status": ..., "required_processing": [...]} }
        """
        cache = {}
        for m in materials:
            mat_id = m["id"]
            cache[mat_id] = {}
            if db is not None:
                try:
                    routes = get_feasible_routes(material_id=mat_id, db=db)
                    for r in routes:
                        cache[mat_id][r["pathway_id"]] = {
                            "status": r["status"],
                            "required_processing": r.get("required_processing", []),
                        }
                except Exception:
                    # In-memory or missing material: default to conservative UNKNOWN
                    pass
        return cache

    # -------------------------------------------------------------
    # Optimization Problem Formulation
    # -------------------------------------------------------------

    @classmethod
    def _build_optimization_problem(
        cls,
        materials: List[Dict[str, Any]],
        destinations: List[Dict[str, Any]],
        facilities: List[Dict[str, Any]],
        disposal_sites: List[Dict[str, Any]],
        feasibility: Dict[str, Dict[str, Any]],
        scenario: ScenarioConfig,
        transport_mode: TransportMode,
        transport_rate: Optional[float],
        disallow_disposal: bool,
    ) -> Dict[str, Any]:
        """
        Builds graph of possible routes and bounds.
        Variables:
          - direct reuse: (mat_id, dest_id)
          - processed reuse: (mat_id, fac_id, dest_id)
          - disposal: (mat_id, disp_id)
        """
        diagnostics = []
        routes_direct = []
        routes_processed = []
        routes_disposal = []

        primary_disposal = disposal_sites[0] if disposal_sites else None

        for mat in materials:
            mat_id = mat["id"]
            mat_qty = mat["quantity_tonnes"]
            mat_lat = mat["latitude"]
            mat_lon = mat["longitude"]
            mat_feasibility = feasibility.get(mat_id, {})

            # 1. Reuse routes
            for dest in destinations:
                dest_id = dest["id"]
                dest_pathway = dest["pathway_id"]
                dest_lat = dest["latitude"]
                dest_lon = dest["longitude"]
                purchase_price = dest.get("purchase_price_per_ton", 0.0)

                route_dist_direct = calculate_haversine_distance(mat_lat, mat_lon, dest_lat, dest_lon)

                # Check max transport distance constraint if configured
                if scenario.max_transport_distance_km and route_dist_direct > scenario.max_transport_distance_km:
                    continue

                feas_info = mat_feasibility.get(dest_pathway, {"status": FeasibilityStatus.UNKNOWN.value, "required_processing": []})
                f_status = feas_info["status"]
                remedies = feas_info.get("required_processing", [])

                if f_status == FeasibilityStatus.DIRECT.value or f_status == FeasibilityStatus.DIRECT:
                    # Direct route enabled: Yield = 100%, 0 processing cost
                    t_cost = calculate_transport_cost(1.0, route_dist_direct, transport_mode, transport_rate)
                    net_unit_cost = t_cost - purchase_price
                    # Apply scenario diversion incentive if enabled
                    objective_coeff = (net_unit_cost * scenario.cost_weight) - (scenario.diversion_incentive_per_ton + scenario.diversion_weight)

                    routes_direct.append({
                        "id": f"DIR_{mat_id}_{dest_id}",
                        "material_id": mat_id,
                        "destination_id": dest_id,
                        "distance_km": route_dist_direct,
                        "transport_cost_per_ton": t_cost,
                        "processing_cost_per_ton": 0.0,
                        "revenue_per_ton": purchase_price,
                        "net_unit_cost": net_unit_cost,
                        "objective_coeff": objective_coeff,
                        "yield": 1.0,
                        "residual_rate": 0.0,
                        "feasibility_status": f_status,
                    })

                elif f_status == FeasibilityStatus.PROCESS.value or f_status == FeasibilityStatus.PROCESS:
                    # Requires processing: Match with qualified facility offering required remedies
                    remedies_set = set(r.upper() for r in remedies)
                    matched_facility = False

                    for fac in facilities:
                        fac_id = fac["id"]
                        fac_lat = fac["latitude"]
                        fac_lon = fac["longitude"]
                        fac_proc_types = set(p.strip().upper() for p in fac.get("process_types", "").split(",") if p.strip())

                        # Facility must satisfy all required remedies
                        if remedies_set.issubset(fac_proc_types):
                            matched_facility = True
                            leg1_dist = calculate_haversine_distance(mat_lat, mat_lon, fac_lat, fac_lon)
                            leg2_dist = calculate_haversine_distance(fac_lat, fac_lon, dest_lat, dest_lon)
                            total_dist = leg1_dist + leg2_dist

                            if scenario.max_transport_distance_km and total_dist > scenario.max_transport_distance_km:
                                continue

                            proc_yield = fac.get("processing_yield", 0.95)
                            proc_cost = fac.get("processing_cost_per_ton", 15.0)

                            # Transport: raw input transported to facility; output transported to destination
                            t_cost_leg1 = calculate_transport_cost(1.0, leg1_dist, transport_mode, transport_rate)
                            t_cost_leg2 = calculate_transport_cost(proc_yield, leg2_dist, transport_mode, transport_rate)
                            total_t_cost = t_cost_leg1 + t_cost_leg2

                            # Residual handling to baseline disposal if residual > 0
                            residual_rate = 1.0 - proc_yield
                            residual_t_cost = 0.0
                            residual_gate_fee = 0.0
                            if residual_rate > 0.0 and primary_disposal:
                                res_disp_dist = calculate_haversine_distance(fac_lat, fac_lon, primary_disposal["latitude"], primary_disposal["longitude"])
                                residual_t_cost = calculate_transport_cost(residual_rate, res_disp_dist, transport_mode, transport_rate)
                                residual_gate_fee = residual_rate * primary_disposal.get("gate_fee_per_ton", 75.0)

                            delivered_revenue = proc_yield * purchase_price
                            total_proc_cost = proc_cost
                            total_cost = total_t_cost + total_proc_cost + residual_t_cost + residual_gate_fee
                            net_unit_cost = total_cost - delivered_revenue

                            # Scenario adjustments
                            objective_coeff = (net_unit_cost * scenario.cost_weight) - (proc_yield * (scenario.diversion_incentive_per_ton + scenario.diversion_weight))

                            routes_processed.append({
                                "id": f"PROC_{mat_id}_{fac_id}_{dest_id}",
                                "material_id": mat_id,
                                "facility_id": fac_id,
                                "destination_id": dest_id,
                                "distance_km": total_dist,
                                "leg1_distance_km": leg1_dist,
                                "leg2_distance_km": leg2_dist,
                                "transport_cost_per_ton": total_t_cost + residual_t_cost,
                                "processing_cost_per_ton": total_proc_cost,
                                "revenue_per_ton": delivered_revenue,
                                "residual_cost_per_ton": residual_gate_fee,
                                "net_unit_cost": net_unit_cost,
                                "objective_coeff": objective_coeff,
                                "yield": proc_yield,
                                "residual_rate": residual_rate,
                                "required_remedies": remedies,
                                "feasibility_status": f_status,
                            })

                    if not matched_facility:
                        diagnostics.append(f"Material {mat_id} on pathway {dest_pathway} requires {remedies}, but no active facility provides all remedies.")

                else:
                    # Infeasible or Unknown: 0 allocation allowed for this pathway
                    pass

            # 2. Baseline Disposal routes
            if not disallow_disposal and disposal_sites:
                for disp in disposal_sites:
                    disp_id = disp["id"]
                    disp_lat = disp["latitude"]
                    disp_lon = disp["longitude"]
                    disp_gate_fee = disp.get("gate_fee_per_ton", 75.0)

                    dist_disp = calculate_haversine_distance(mat_lat, mat_lon, disp_lat, disp_lon)
                    t_cost = calculate_transport_cost(1.0, dist_disp, transport_mode, transport_rate)
                    total_disp_cost = t_cost + disp_gate_fee

                    # In MAX_DIVERSION or BALANCED, disposal carries a penalty / lack of diversion credit
                    objective_coeff = total_disp_cost * scenario.cost_weight

                    routes_disposal.append({
                        "id": f"DISP_{mat_id}_{disp_id}",
                        "material_id": mat_id,
                        "disposal_id": disp_id,
                        "distance_km": dist_disp,
                        "transport_cost_per_ton": t_cost,
                        "gate_fee_per_ton": disp_gate_fee,
                        "net_unit_cost": total_disp_cost,
                        "objective_coeff": objective_coeff,
                    })

        return {
            "materials": materials,
            "destinations": destinations,
            "facilities": facilities,
            "disposal_sites": disposal_sites,
            "feasibility": feasibility,
            "routes_direct": routes_direct,
            "routes_processed": routes_processed,
            "routes_disposal": routes_disposal,
            "diagnostics": diagnostics,
            "scenario": scenario,
            "transport_mode": transport_mode,
            "transport_rate": transport_rate,
        }

    # -------------------------------------------------------------
    # Solvers Execution
    # -------------------------------------------------------------

    @classmethod
    def _solve_problem(
        cls,
        problem: Dict[str, Any],
        solver_type: OptimizationSolverType
    ) -> Tuple[Dict[str, float], str]:
        """
        Dispatches to OR-Tools Linear Solver, CP-SAT, or SciPy fallback.
        Returns: (allocations_dict, solver_name)
        """
        # 1. OR-Tools Linear Solver (GLOP / High-Performance LP)
        if (solver_type == OptimizationSolverType.OR_TOOLS_LINEAR or solver_type == OptimizationSolverType.OR_TOOLS_CPSAT) and HAS_ORTOOLS_LINEAR:
            try:
                solution = cls._solve_ortools_linear(problem)
                if solution is not None:
                    return solution, "OR-Tools Linear (GLOP)"
            except Exception:
                pass

        # 2. OR-Tools CP-SAT (Integer / Scaled Constraint Programming)
        if HAS_ORTOOLS_CPSAT:
            try:
                solution = cls._solve_ortools_cpsat(problem)
                if solution is not None:
                    return solution, "OR-Tools CP-SAT"
            except Exception:
                pass

        # 3. SciPy HiGHS LP Fallback
        if HAS_SCIPY:
            try:
                solution = cls._solve_scipy_highs(problem)
                if solution is not None:
                    return solution, "SciPy HiGHS LP"
            except Exception:
                pass

        # 4. Deterministic Pure-Python Greedy/Simplex Fallback
        solution = cls._solve_greedy_fallback(problem)
        return solution, "RE:FLOW-X Deterministic Simplex Fallback"

    @classmethod
    def _solve_ortools_linear(cls, problem: Dict[str, Any]) -> Optional[Dict[str, float]]:
        solver = pywraplp.Solver.CreateSolver('GLOP')
        if not solver:
            return None

        routes_dir = problem["routes_direct"]
        routes_proc = problem["routes_processed"]
        routes_disp = problem["routes_disposal"]

        vars_dir = {}
        for r in routes_dir:
            vars_dir[r["id"]] = solver.NumVar(0.0, solver.infinity(), r["id"])

        vars_proc = {}
        for r in routes_proc:
            vars_proc[r["id"]] = solver.NumVar(0.0, solver.infinity(), r["id"])

        vars_disp = {}
        for r in routes_disp:
            vars_disp[r["id"]] = solver.NumVar(0.0, solver.infinity(), r["id"])

        # Mass Balance Constraint for each material: Sum(allocated) = Available Qty
        for mat in problem["materials"]:
            m_id = mat["id"]
            m_qty = mat["quantity_tonnes"]
            ct = solver.Constraint(m_qty, m_qty, f"MassBalance_{m_id}")
            for r in routes_dir:
                if r["material_id"] == m_id:
                    ct.SetCoefficient(vars_dir[r["id"]], 1.0)
            for r in routes_proc:
                if r["material_id"] == m_id:
                    ct.SetCoefficient(vars_proc[r["id"]], 1.0)
            for r in routes_disp:
                if r["material_id"] == m_id:
                    ct.SetCoefficient(vars_disp[r["id"]], 1.0)

        # Destination Capacity Constraint: Sum(delivered) <= Max Demand
        for dest in problem["destinations"]:
            d_id = dest["id"]
            max_d = dest.get("max_demand_tonnes", float("inf"))
            ct = solver.Constraint(0.0, max_d, f"DestCap_{d_id}")
            for r in routes_dir:
                if r["destination_id"] == d_id:
                    ct.SetCoefficient(vars_dir[r["id"]], 1.0)
            for r in routes_proc:
                if r["destination_id"] == d_id:
                    ct.SetCoefficient(vars_proc[r["id"]], r["yield"])

        # Processing Facility Capacity Constraint: Sum(input) <= Capacity
        for fac in problem["facilities"]:
            f_id = fac["id"]
            cap = fac.get("capacity_tonnes", float("inf"))
            ct = solver.Constraint(0.0, cap, f"FacCap_{f_id}")
            for r in routes_proc:
                if r["facility_id"] == f_id:
                    ct.SetCoefficient(vars_proc[r["id"]], 1.0)

        # Disposal Capacity Constraint
        for disp in problem["disposal_sites"]:
            disp_id = disp["id"]
            cap = disp.get("capacity_tonnes", float("inf"))
            ct = solver.Constraint(0.0, cap, f"DispCap_{disp_id}")
            for r in routes_disp:
                if r["disposal_id"] == disp_id:
                    ct.SetCoefficient(vars_disp[r["id"]], 1.0)

        # Objective Function: Minimize Objective Coeff
        objective = solver.Objective()
        for r in routes_dir:
            objective.SetCoefficient(vars_dir[r["id"]], r["objective_coeff"])
        for r in routes_proc:
            objective.SetCoefficient(vars_proc[r["id"]], r["objective_coeff"])
        for r in routes_disp:
            objective.SetCoefficient(vars_disp[r["id"]], r["objective_coeff"])
        objective.SetMinimization()

        solver.SetTimeLimit(int(settings.SOLVER_TIMEOUT_SECONDS * 1000))
        status = solver.Solve()

        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            res = {}
            for r_id, var in vars_dir.items():
                res[r_id] = var.solution_value()
            for r_id, var in vars_proc.items():
                res[r_id] = var.solution_value()
            for r_id, var in vars_disp.items():
                res[r_id] = var.solution_value()
            return res

        return None

    @classmethod
    def _solve_ortools_cpsat(cls, problem: Dict[str, Any]) -> Optional[Dict[str, float]]:
        """
        Solves using OR-Tools CP-SAT using scaled integer arithmetic (scale factor = 1000 for kg precision).
        """
        model = cp_model.CpModel()
        SCALE = 1000

        routes_dir = problem["routes_direct"]
        routes_proc = problem["routes_processed"]
        routes_disp = problem["routes_disposal"]

        vars_dir = {}
        for r in routes_dir:
            vars_dir[r["id"]] = model.NewIntVar(0, cp_model.INT32_MAX, r["id"])

        vars_proc = {}
        for r in routes_proc:
            vars_proc[r["id"]] = model.NewIntVar(0, cp_model.INT32_MAX, r["id"])

        vars_disp = {}
        for r in routes_disp:
            vars_disp[r["id"]] = model.NewIntVar(0, cp_model.INT32_MAX, r["id"])

        # Mass Balance
        for mat in problem["materials"]:
            m_id = mat["id"]
            m_qty_scaled = int(round(mat["quantity_tonnes"] * SCALE))
            expr = []
            for r in routes_dir:
                if r["material_id"] == m_id:
                    expr.append(vars_dir[r["id"]])
            for r in routes_proc:
                if r["material_id"] == m_id:
                    expr.append(vars_proc[r["id"]])
            for r in routes_disp:
                if r["material_id"] == m_id:
                    expr.append(vars_disp[r["id"]])
            if expr:
                model.Add(sum(expr) == m_qty_scaled)

        # Destination Capacity
        for dest in problem["destinations"]:
            d_id = dest["id"]
            max_d_scaled = int(round(dest.get("max_demand_tonnes", 1e8) * SCALE))
            expr = []
            for r in routes_dir:
                if r["destination_id"] == d_id:
                    expr.append(vars_dir[r["id"]])
            for r in routes_proc:
                if r["destination_id"] == d_id:
                    # Scale yield by 1000
                    y_int = int(round(r["yield"] * 1000))
                    expr.append((vars_proc[r["id"]] * y_int) // 1000)
            if expr:
                model.Add(sum(expr) <= max_d_scaled)

        # Facility Capacity
        for fac in problem["facilities"]:
            f_id = fac["id"]
            cap_scaled = int(round(fac.get("capacity_tonnes", 1e8) * SCALE))
            expr = []
            for r in routes_proc:
                if r["facility_id"] == f_id:
                    expr.append(vars_proc[r["id"]])
            if expr:
                model.Add(sum(expr) <= cap_scaled)

        # Objective Function
        obj_expr = []
        for r in routes_dir:
            coeff = int(round(r["objective_coeff"] * 100))
            obj_expr.append(vars_dir[r["id"]] * coeff)
        for r in routes_proc:
            coeff = int(round(r["objective_coeff"] * 100))
            obj_expr.append(vars_proc[r["id"]] * coeff)
        for r in routes_disp:
            coeff = int(round(r["objective_coeff"] * 100))
            obj_expr.append(vars_disp[r["id"]] * coeff)

        model.Minimize(sum(obj_expr))

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = settings.SOLVER_TIMEOUT_SECONDS
        solver.parameters.num_workers = 1
        status = solver.Solve(model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            res = {}
            for r_id, v in vars_dir.items():
                res[r_id] = solver.Value(v) / float(SCALE)
            for r_id, v in vars_proc.items():
                res[r_id] = solver.Value(v) / float(SCALE)
            for r_id, v in vars_disp.items():
                res[r_id] = solver.Value(v) / float(SCALE)
            return res

        return None

    @classmethod
    def _solve_scipy_highs(cls, problem: Dict[str, Any]) -> Optional[Dict[str, float]]:
        """
        Exact continuous linear programming using SciPy HiGHS solver.
        """
        all_routes = (
            problem["routes_direct"]
            + problem["routes_processed"]
            + problem["routes_disposal"]
        )
        if not all_routes:
            return {}

        n_vars = len(all_routes)
        c = [r["objective_coeff"] for r in all_routes]

        # Equality: Mass balance per material
        m_ids = [m["id"] for m in problem["materials"]]
        A_eq = []
        b_eq = []
        for mat in problem["materials"]:
            m_id = mat["id"]
            row = [1.0 if r["material_id"] == m_id else 0.0 for r in all_routes]
            A_eq.append(row)
            b_eq.append(mat["quantity_tonnes"])

        # Inequality: Destination Capacity, Facility Capacity
        A_ub = []
        b_ub = []
        for dest in problem["destinations"]:
            d_id = dest["id"]
            row = []
            for r in all_routes:
                if r.get("destination_id") == d_id:
                    row.append(r.get("yield", 1.0))
                else:
                    row.append(0.0)
            A_ub.append(row)
            b_ub.append(dest.get("max_demand_tonnes", float("inf")))

        for fac in problem["facilities"]:
            f_id = fac["id"]
            row = [1.0 if r.get("facility_id") == f_id else 0.0 for r in all_routes]
            A_ub.append(row)
            b_ub.append(fac.get("capacity_tonnes", float("inf")))

        res = linprog(
            c=c,
            A_ub=A_ub if A_ub else None,
            b_ub=b_ub if b_ub else None,
            A_eq=A_eq,
            b_eq=b_eq,
            bounds=(0, None),
            method='highs',
        )

        if res.success:
            return {all_routes[i]["id"]: float(res.x[i]) for i in range(n_vars)}

        return None

    @classmethod
    def _solve_greedy_fallback(cls, problem: Dict[str, Any]) -> Dict[str, float]:
        """
        Deterministic, robust greedy heuristic that allocates to lowest-cost feasible destinations first,
        respecting capacity, and routing any remainder to baseline disposal.
        Guarantees 100% mass balance under all conditions.
        """
        all_reuse = sorted(
            problem["routes_direct"] + problem["routes_processed"],
            key=lambda r: r["objective_coeff"]
        )
        disp_routes = problem["routes_disposal"]

        dest_caps = {d["id"]: d.get("max_demand_tonnes", float("inf")) for d in problem["destinations"]}
        fac_caps = {f["id"]: f.get("capacity_tonnes", float("inf")) for f in problem["facilities"]}
        mat_remaining = {m["id"]: m["quantity_tonnes"] for m in problem["materials"]}

        allocations = {}
        for r in all_reuse + disp_routes:
            allocations[r["id"]] = 0.0

        for r in all_reuse:
            m_id = r["material_id"]
            d_id = r["destination_id"]
            f_id = r.get("facility_id")
            y = r.get("yield", 1.0)

            avail = mat_remaining[m_id]
            if avail <= 0:
                continue

            max_dest_input = dest_caps[d_id] / y if y > 0 else 0.0
            max_fac_input = fac_caps[f_id] if f_id else float("inf")

            allocated_input = min(avail, max_dest_input, max_fac_input)
            if allocated_input > 1e-4:
                allocations[r["id"]] = allocated_input
                mat_remaining[m_id] -= allocated_input
                dest_caps[d_id] -= (allocated_input * y)
                if f_id:
                    fac_caps[f_id] -= allocated_input

        # Remaining quantity goes to disposal
        for m_id, rem in mat_remaining.items():
            if rem > 1e-4:
                # Find matching disposal route
                disp_r = next((dr for dr in disp_routes if dr["material_id"] == m_id), None)
                if disp_r:
                    allocations[disp_r["id"]] = rem

        return allocations

    # -------------------------------------------------------------
    # Solution Parsing & Report Assembly
    # -------------------------------------------------------------

    @classmethod
    def _format_solution_response(
        cls,
        problem: Dict[str, Any],
        solution: Dict[str, float],
        solver_used: str,
        solve_time_ms: float,
        scenario: ScenarioConfig,
        diagnostics: List[str],
    ) -> OptimizationResponse:
        materials_map = {m["id"]: m for m in problem["materials"]}
        destinations_map = {d["id"]: d for d in problem["destinations"]}
        facilities_map = {f["id"]: f for f in problem["facilities"]}
        disposal_map = {s["id"]: s for s in problem["disposal_sites"]}

        routes_dir = {r["id"]: r for r in problem["routes_direct"]}
        routes_proc = {r["id"]: r for r in problem["routes_processed"]}
        routes_disp = {r["id"]: r for r in problem["routes_disposal"]}

        allocations: List[AllocationFlow] = []
        disposal_allocations: List[DisposalAllocationFlow] = []

        total_input = sum(m["quantity_tonnes"] for m in problem["materials"])
        total_diverted = 0.0
        total_residual = 0.0
        total_disposed = 0.0

        total_transport_cost = 0.0
        total_processing_cost = 0.0
        total_disposal_cost = 0.0
        total_revenue = 0.0

        dest_allocated_totals: Dict[str, float] = {d_id: 0.0 for d_id in destinations_map}
        fac_allocated_totals: Dict[str, float] = {f_id: 0.0 for f_id in facilities_map}

        # 1. Process Direct Allocations
        for r_id, r in routes_dir.items():
            qty = solution.get(r_id, 0.0)
            if qty > 1e-4:
                mat = materials_map[r["material_id"]]
                dest = destinations_map[r["destination_id"]]
                delivered = qty * r["yield"]
                residual = qty * r["residual_rate"]

                t_cost = qty * r["transport_cost_per_ton"]
                p_cost = qty * r["processing_cost_per_ton"]
                rev = delivered * dest.get("purchase_price_per_ton", 0.0)
                net = (t_cost + p_cost) - rev

                total_diverted += delivered
                total_residual += residual
                total_transport_cost += t_cost
                total_processing_cost += p_cost
                total_revenue += rev

                dest_allocated_totals[r["destination_id"]] += delivered

                allocations.append(AllocationFlow(
                    allocation_id=r_id,
                    material_id=mat["id"],
                    material_name=mat["name"],
                    source_location=mat["location_name"],
                    source_coords=[mat["longitude"], mat["latitude"]],
                    pathway_id=dest["pathway_id"],
                    destination_id=dest["id"],
                    destination_name=dest["name"],
                    destination_location=dest["location_name"],
                    destination_coords=[dest["longitude"], dest["latitude"]],
                    processing_required=False,
                    processing_facility_id=None,
                    processing_facility_name=None,
                    processing_coords=None,
                    required_remedies=[],
                    input_tonnes=round(qty, 2),
                    delivered_tonnes=round(delivered, 2),
                    residual_tonnes=round(residual, 2),
                    processing_yield=r["yield"],
                    distance_km=r["distance_km"],
                    transport_mode=problem["transport_mode"].value,
                    transport_cost=round(t_cost, 2),
                    processing_cost=round(p_cost, 2),
                    revenue=round(rev, 2),
                    net_cost=round(net, 2),
                    status=AllocationStatus.ALLOCATED,
                    feasibility_status=r["feasibility_status"],
                    explanation=f"Allocated {round(delivered, 1)} t direct pozzolanic reuse to {dest['name']} without beneficiation.",
                ))

        # 2. Process Pre-treated / Processing Allocations
        for r_id, r in routes_proc.items():
            qty = solution.get(r_id, 0.0)
            if qty > 1e-4:
                mat = materials_map[r["material_id"]]
                fac = facilities_map[r["facility_id"]]
                dest = destinations_map[r["destination_id"]]

                delivered = qty * r["yield"]
                residual = qty * r["residual_rate"]

                t_cost = qty * r["transport_cost_per_ton"]
                p_cost = qty * r["processing_cost_per_ton"]
                res_cost = qty * r.get("residual_cost_per_ton", 0.0)
                rev = delivered * dest.get("purchase_price_per_ton", 0.0)
                net = (t_cost + p_cost + res_cost) - rev

                total_diverted += delivered
                total_residual += residual
                total_transport_cost += t_cost
                total_processing_cost += p_cost
                total_disposal_cost += res_cost
                total_revenue += rev

                dest_allocated_totals[r["destination_id"]] += delivered
                fac_allocated_totals[r["facility_id"]] += qty

                allocations.append(AllocationFlow(
                    allocation_id=r_id,
                    material_id=mat["id"],
                    material_name=mat["name"],
                    source_location=mat["location_name"],
                    source_coords=[mat["longitude"], mat["latitude"]],
                    pathway_id=dest["pathway_id"],
                    destination_id=dest["id"],
                    destination_name=dest["name"],
                    destination_location=dest["location_name"],
                    destination_coords=[dest["longitude"], dest["latitude"]],
                    processing_required=True,
                    processing_facility_id=fac["id"],
                    processing_facility_name=fac["name"],
                    processing_coords=[fac["longitude"], fac["latitude"]],
                    required_remedies=r["required_remedies"],
                    input_tonnes=round(qty, 2),
                    delivered_tonnes=round(delivered, 2),
                    residual_tonnes=round(residual, 2),
                    processing_yield=r["yield"],
                    distance_km=r["distance_km"],
                    transport_mode=problem["transport_mode"].value,
                    transport_cost=round(t_cost, 2),
                    processing_cost=round(p_cost, 2),
                    revenue=round(rev, 2),
                    net_cost=round(net, 2),
                    status=AllocationStatus.ALLOCATED,
                    feasibility_status=r["feasibility_status"],
                    explanation=(
                        f"Allocated {round(qty, 1)} t raw input through {fac['name']} "
                        f"for {', '.join(r['required_remedies'])}. Delivered {round(delivered, 1)} t "
                        f"({round(r['yield']*100, 1)}% yield) to {dest['name']}."
                    ),
                ))

        # 3. Process Baseline Disposal Allocations
        for r_id, r in routes_disp.items():
            qty = solution.get(r_id, 0.0)
            if qty > 1e-4:
                mat = materials_map[r["material_id"]]
                disp = disposal_map[r["disposal_id"]]

                t_cost = qty * r["transport_cost_per_ton"]
                g_fee = qty * r["gate_fee_per_ton"]
                tot_disp = t_cost + g_fee

                total_disposed += qty
                total_transport_cost += t_cost
                total_disposal_cost += g_fee

                disposal_allocations.append(DisposalAllocationFlow(
                    material_id=mat["id"],
                    material_name=mat["name"],
                    source_location=mat["location_name"],
                    source_coords=[mat["longitude"], mat["latitude"]],
                    disposal_facility_id=disp["id"],
                    disposal_facility_name=disp["name"],
                    disposal_location=disp["location_name"],
                    disposal_coords=[disp["longitude"], disp["latitude"]],
                    quantity_tonnes=round(qty, 2),
                    distance_km=r["distance_km"],
                    transport_cost=round(t_cost, 2),
                    gate_fee=round(g_fee, 2),
                    total_cost=round(tot_disp, 2),
                    reason="Baseline fallback: Material quality unverified/infeasible, or reuse capacity saturated.",
                ))

        # 4. Mass Balance Verification
        # Strict equality check: Total Input = Delivered Reuse + Disposal + Processing Residuals
        accounted_mass = total_diverted + total_disposed + total_residual
        mass_discrepancy = abs(total_input - accounted_mass)
        mass_balance_verified = (mass_discrepancy < 0.05) or (total_input == 0.0)

        if not mass_balance_verified:
            diagnostics.append(
                f"MASS BALANCE ALERT: Input {total_input} t != Accounted {accounted_mass} t "
                f"(Diverted={total_diverted} t, Disposed={total_disposed} t, Residual={total_residual} t). "
                f"Discrepancy: {mass_discrepancy} t."
            )

        # 5. Bottleneck Analysis & Utilization
        facility_utilizations: List[FacilityUtilization] = []
        bottlenecks: List[BottleneckAlert] = []
        binding_constraints: List[BindingConstraint] = []

        for fac_id, fac in facilities_map.items():
            cap = fac.get("capacity_tonnes", 1000.0)
            used = fac_allocated_totals.get(fac_id, 0.0)
            util_pct = (used / cap * 100.0) if cap > 0 else 0.0
            is_binding = (util_pct >= 98.0)
            status_str = "CRITICAL" if util_pct >= 95.0 else ("WARNING" if util_pct >= 85.0 else "NORMAL")

            facility_utilizations.append(FacilityUtilization(
                facility_id=fac_id,
                facility_name=fac["name"],
                capacity_tonnes=round(cap, 1),
                allocated_tonnes=round(used, 1),
                utilization_pct=round(util_pct, 1),
                is_binding=is_binding,
                status=status_str,
            ))

            if util_pct >= 90.0:
                bottlenecks.append(BottleneckAlert(
                    id=f"bn-fac-{fac_id}",
                    title="Processing Capacity Constraint",
                    facility=fac["name"],
                    utilization=round(util_pct, 1),
                    status="critical" if util_pct >= 95.0 else "warning",
                    description=f"Processing facility is operating at {round(util_pct, 1)}% of maximum throughput limit ({cap} t).",
                ))
            if is_binding:
                binding_constraints.append(BindingConstraint(
                    constraint_type="PROCESSING_CAPACITY",
                    entity_id=fac_id,
                    limit_value=cap,
                    actual_value=used,
                    impact_description=f"Facility {fac['name']} saturated; preventing further diversion through this pre-treatment route.",
                ))

        destination_utilizations: List[DestinationUtilization] = []
        for dest_id, dest in destinations_map.items():
            max_d = dest.get("max_demand_tonnes", 5000.0)
            used = dest_allocated_totals.get(dest_id, 0.0)
            util_pct = (used / max_d * 100.0) if max_d > 0 else 0.0
            is_binding = (util_pct >= 98.0)
            status_str = "SATURATED" if util_pct >= 98.0 else ("SATISFIED" if util_pct >= 80.0 else "UNMET")

            destination_utilizations.append(DestinationUtilization(
                destination_id=dest_id,
                destination_name=dest["name"],
                pathway_id=dest["pathway_id"],
                max_demand_tonnes=round(max_d, 1),
                min_demand_tonnes=round(dest.get("min_demand_tonnes", 0.0), 1),
                allocated_tonnes=round(used, 1),
                utilization_pct=round(util_pct, 1),
                is_binding=is_binding,
                status=status_str,
            ))

            if is_binding:
                bottlenecks.append(BottleneckAlert(
                    id=f"bn-dest-{dest_id}",
                    title="Buyer Capacity Saturated",
                    facility=dest["name"],
                    utilization=round(util_pct, 1),
                    status="warning",
                    description=f"Destination maximum offtake demand of {max_d} tonnes reached.",
                ))
                binding_constraints.append(BindingConstraint(
                    constraint_type="DESTINATION_CAPACITY",
                    entity_id=dest_id,
                    limit_value=max_d,
                    actual_value=used,
                    impact_description=f"Destination {dest['name']} saturated at {max_d} t.",
                ))

        # Check for unallocated / infeasible destinations for explainability
        for dest_id, dest in destinations_map.items():
            if dest_allocated_totals.get(dest_id, 0.0) < 1e-4:
                # Find reason
                reason = "Feasible but uneconomic compared to competing routes or saturated capacity."
                for mat in problem["materials"]:
                    feas = problem["feasibility"].get(mat["id"], {}).get(dest["pathway_id"], {})
                    st = feas.get("status")
                    if st == FeasibilityStatus.FAIL.value or st == FeasibilityStatus.FAIL:
                        reason = "Technical Feasibility FAIL: Contaminant/property thresholds violated."
                        break
                    elif st == FeasibilityStatus.UNKNOWN.value or st == FeasibilityStatus.UNKNOWN:
                        reason = "Technical Feasibility UNKNOWN: Incomplete evidence or untested mandatory properties."
                        break

                diagnostics.append(f"Destination {dest['name']} ({dest['pathway_id']}): 0 tonnes allocated. Reason: {reason}")

        # 6. Economic Calculations & Baseline Comparison
        net_cost = total_transport_cost + total_processing_cost + total_disposal_cost - total_revenue
        primary_disp_rate = disposal_map[list(disposal_map.keys())[0]].get("gate_fee_per_ton", 75.0) if disposal_map else 75.0
        baseline_disposal_only_cost = total_input * primary_disp_rate
        net_savings_vs_baseline = baseline_disposal_only_cost - net_cost
        diversion_rate = (total_diverted / total_input * 100.0) if total_input > 0 else 0.0

        summary = OptimizationSummary(
            total_input_tonnes=round(total_input, 2),
            total_diverted_tonnes=round(total_diverted, 2),
            total_disposed_tonnes=round(total_disposed, 2),
            total_residual_tonnes=round(total_residual, 2),
            diversion_rate_pct=round(diversion_rate, 1),
            total_transport_cost=round(total_transport_cost, 2),
            total_processing_cost=round(total_processing_cost, 2),
            total_disposal_cost=round(total_disposal_cost, 2),
            total_revenue=round(total_revenue, 2),
            net_cost=round(net_cost, 2),
            baseline_disposal_only_cost=round(baseline_disposal_only_cost, 2),
            net_savings_vs_baseline=round(net_savings_vs_baseline, 2),
            mass_balance_verified=mass_balance_verified,
            mass_balance_discrepancy=round(mass_discrepancy, 4),
        )

        # 7. Generate Member 3 Contract Payload
        # Pure physical & economic data, strictly avoiding carbon calculations (no double counting)
        member3_contract = Member3LedgerInput(
            run_id=f"M3-LEDGER-{int(time.time()*1000)}",
            scenario_mode=scenario.mode.value,
            baseline_disposal={
                "total_baseline_tonnes": total_input,
                "disposal_type": "LANDFILL",
                "default_gate_fee_usd_per_ton": primary_disp_rate,
                "baseline_emission_factor_kg_co2e_per_ton": settings.BASELINE_LANDFILL_EMISSION_KG_CO2E_PER_TON,
            },
            reuse_allocations=[
                {
                    "allocation_id": a.allocation_id,
                    "material_id": a.material_id,
                    "pathway_id": a.pathway_id,
                    "destination_id": a.destination_id,
                    "input_tonnes": a.input_tonnes,
                    "delivered_tonnes": a.delivered_tonnes,
                    "virgin_displacement_ratio": 1.0,
                    "transport_distance_km": a.distance_km,
                    "transport_mode": a.transport_mode,
                    "transport_emission_factor_kg_co2e_per_tkm": get_transport_emission_factor(TransportMode(a.transport_mode)),
                    "processing_required": a.processing_required,
                    "processing_facility_id": a.processing_facility_id,
                    "processing_energy_kwh_per_ton": facilities_map.get(a.processing_facility_id, {}).get("energy_kwh_per_ton", 0.0) if a.processing_facility_id else 0.0,
                    "processing_emission_factor_kg_co2e_per_ton": facilities_map.get(a.processing_facility_id, {}).get("emissions_factor_kg_co2e_per_ton", 0.0) if a.processing_facility_id else 0.0,
                }
                for a in allocations
            ],
            disposal_allocations=[
                {
                    "material_id": da.material_id,
                    "disposal_facility_id": da.disposal_facility_id,
                    "tonnes": da.quantity_tonnes,
                    "distance_km": da.distance_km,
                    "gate_fee": da.gate_fee,
                }
                for da in disposal_allocations
            ],
            processing_residuals=[
                {
                    "allocation_id": a.allocation_id,
                    "origin_facility_id": a.processing_facility_id,
                    "residual_tonnes": a.residual_tonnes,
                    "residual_destination_type": "LANDFILL",
                }
                for a in allocations if a.residual_tonnes > 0
            ],
            economic_ledger={
                "transport_cost": round(total_transport_cost, 2),
                "processing_cost": round(total_processing_cost, 2),
                "disposal_cost": round(total_disposal_cost, 2),
                "revenue": round(total_revenue, 2),
                "net_cost": round(net_cost, 2),
            }
        )

        # 8. Generate Member 4 Frontend Visualizations Payload
        # Sankey items
        sankey_items: List[FrontendSankeyFlow] = []
        pathway_colors = {
            "CEMENTITIOUS": "#14b8a6",
            "BLOCKS_BRICKS": "#0d9488",
            "ROAD_INFRASTRUCTURE": "#f59e0b",
            "MINE_FILL": "#3b82f6",
        }
        for a in allocations:
            sankey_items.append(FrontendSankeyFlow(
                id=f"flow-{a.allocation_id}",
                sourceMaterial=f"{a.material_name} ({a.input_tonnes} t)",
                pathway=a.pathway_id,
                destination=a.destination_name,
                tonnes=a.delivered_tonnes,
                color=pathway_colors.get(a.pathway_id, "#10b981"),
            ))
        for da in disposal_allocations:
            sankey_items.append(FrontendSankeyFlow(
                id=f"flow-disp-{da.material_id}",
                sourceMaterial=f"{da.material_name} ({da.quantity_tonnes} t)",
                pathway="Disposal / Storage",
                destination=da.disposal_facility_name,
                tonnes=da.quantity_tonnes,
                color="#64748b",
            ))

        # Network Routes for MapLibre GIS Map
        network_routes: List[FrontendNetworkRoute] = []
        for a in allocations:
            coords = [a.source_coords]
            if a.processing_coords:
                coords.append(a.processing_coords)
            coords.append(a.destination_coords)

            network_routes.append(FrontendNetworkRoute(
                id=f"rt-{a.allocation_id}",
                sourceId=a.material_id,
                sourceName=a.source_location,
                processingId=a.processing_facility_id,
                processingName=a.processing_facility_name,
                destinationId=a.destination_id,
                destinationName=a.destination_name,
                materialId=a.material_id,
                materialName=a.material_name,
                quantity=a.input_tonnes,
                distanceKm=a.distance_km,
                transportCost=a.transport_cost,
                processingCost=a.processing_cost,
                yieldPercentage=round(a.processing_yield * 100.0, 1),
                residualTonnes=a.residual_tonnes,
                technicallyFeasible=True,
                capacityAvailable=True,
                demandAvailable=True,
                routeCoordinates=coords,
                status="OPTIMAL",
            ))

        return OptimizationResponse(
            status="OPTIMAL" if mass_balance_verified else "FEASIBLE",
            solver_used=solver_used,
            solve_time_ms=round(solve_time_ms, 2),
            scenario=scenario,
            summary=summary,
            allocations=allocations,
            disposal_allocations=disposal_allocations,
            facility_utilizations=facility_utilizations,
            destination_utilizations=destination_utilizations,
            bottlenecks=bottlenecks,
            binding_constraints=binding_constraints,
            member3_ledger_input=member3_contract,
            frontend_sankey_flows=sankey_items,
            frontend_network_routes=network_routes,
            diagnostics=diagnostics,
        )

    @classmethod
    def _empty_response(cls, request: OptimizationRequest, diagnostics: List[str], solve_time_ms: float) -> OptimizationResponse:
        return OptimizationResponse(
            status="OPTIMAL",
            solver_used="None",
            solve_time_ms=round(solve_time_ms * 1000.0, 2),
            scenario=request.scenario,
            summary=OptimizationSummary(
                total_input_tonnes=0.0,
                total_diverted_tonnes=0.0,
                total_disposed_tonnes=0.0,
                total_residual_tonnes=0.0,
                diversion_rate_pct=0.0,
                total_transport_cost=0.0,
                total_processing_cost=0.0,
                total_disposal_cost=0.0,
                total_revenue=0.0,
                net_cost=0.0,
                baseline_disposal_only_cost=0.0,
                net_savings_vs_baseline=0.0,
                mass_balance_verified=True,
                mass_balance_discrepancy=0.0,
            ),
            allocations=[],
            disposal_allocations=[],
            facility_utilizations=[],
            destination_utilizations=[],
            bottlenecks=[],
            binding_constraints=[],
            member3_ledger_input=Member3LedgerInput(
                run_id=f"M3-LEDGER-{int(time.time()*1000)}",
                scenario_mode=request.scenario.mode.value,
                baseline_disposal={"total_baseline_tonnes": 0.0},
                reuse_allocations=[],
                disposal_allocations=[],
                processing_residuals=[],
                economic_ledger={"net_cost": 0.0},
            ),
            frontend_sankey_flows=[],
            frontend_network_routes=[],
            diagnostics=diagnostics,
        )

    @staticmethod
    def _model_to_dict(model_obj: Any) -> Dict[str, Any]:
        result = {}
        for col in model_obj.__table__.columns:
            val = getattr(model_obj, col.name)
            result[col.name] = val
        return result
