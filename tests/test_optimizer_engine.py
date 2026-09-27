import pytest
from backend.app.schemas.optimizer import (
    OptimizationRequest,
    ScenarioConfig,
    ScenarioMode,
    OptimizationSolverType,
    TransportMode,
    FacilityCreate,
    DestinationCreate,
    DisposalSiteCreate,
)
from backend.app.engine.optimizer import AllocationOptimizer
from backend.app.engine.transport import calculate_haversine_distance, calculate_transport_cost


def assert_strict_mass_balance(response, tolerance=1e-3):
    """
    Automated mass balance verification assertion (Step 19):
    Every successful optimization must strictly satisfy:
    Total Input = Delivered Reuse + Processing Residuals + Disposal
    """
    summary = response.summary
    total_input = summary.total_input_tonnes
    total_delivered = summary.total_diverted_tonnes
    total_residual = summary.total_residual_tonnes
    total_disposed = summary.total_disposed_tonnes

    accounted = total_delivered + total_residual + total_disposed
    discrepancy = abs(total_input - accounted)

    assert summary.mass_balance_verified is True
    assert discrepancy < tolerance, (
        f"Mass balance violation: Input={total_input} t, Accounted={accounted} t "
        f"(Delivered={total_delivered} t, Residual={total_residual} t, Disposed={total_disposed} t), "
        f"Discrepancy={discrepancy} t"
    )


def test_distance_and_transport_cost():
    # Nagpur to Bhilai distance (~240-270 km road)
    dist = calculate_haversine_distance(21.1458, 79.0882, 21.1938, 81.3856)
    assert 220.0 < dist < 320.0

    # Same location -> 0 km
    assert calculate_haversine_distance(21.0, 79.0, 21.0, 79.0) == 0.0

    # Transport cost calculation
    cost = calculate_transport_cost(tonnes=100.0, distance_km=150.0, mode=TransportMode.TRUCK_DIESEL)
    # 100 t * 150 km * $0.10/t-km = $1500.00
    assert cost == 1500.0


def test_1_one_waste_stream_to_one_feasible_destination(db_session):
    """1. One waste stream -> one feasible destination (FA-001 direct cementitious)"""
    custom_dest = [
        DestinationCreate(
            id="DEST-CEM-SOLAPUR",
            name="Solapur Ready-Mix Concrete Plant",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=2500.0,
            purchase_price_per_ton=35.0,
            location_name="Solapur MIDC",
            latitude=17.66,
            longitude=75.91,
        )
    ]
    req = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dest,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert res.summary.total_input_tonnes == 1850.0
    assert res.summary.total_diverted_tonnes == 1850.0
    assert_strict_mass_balance(res)

    # Cementitious route should be present
    cement_alloc = next((a for a in res.allocations if a.pathway_id == "CEMENTITIOUS"), None)
    assert cement_alloc is not None
    assert cement_alloc.delivered_tonnes == 1850.0
    assert cement_alloc.processing_required is False


def test_2_one_waste_stream_to_multiple_destinations(db_session):
    """2. One waste stream -> multiple destinations when capacity splits flows"""
    # Create custom destination with small capacity to force split
    custom_dests = [
        DestinationCreate(
            id="DEST-SPLIT-1",
            name="Small Cement Mill",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=500.0,
            purchase_price_per_ton=35.0,
            location_name="Near Site",
            latitude=17.7,
            longitude=76.0,
        ),
        DestinationCreate(
            id="DEST-SPLIT-2",
            name="Secondary Brick Yard",
            pathway_id="BLOCKS_BRICKS",
            max_demand_tonnes=1000.0,
            purchase_price_per_ton=30.0,
            location_name="Secondary Site",
            latitude=17.8,
            longitude=76.1,
        ),
    ]
    req = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert_strict_mass_balance(res)

    # First destination receives up to its capacity 500t
    alloc1 = next((a for a in res.allocations if a.destination_id == "DEST-SPLIT-1"), None)
    assert alloc1 is not None
    assert alloc1.delivered_tonnes == 500.0

    # Remaining material goes to secondary or disposal
    assert res.summary.total_diverted_tonnes + res.summary.total_disposed_tonnes == 1850.0


def test_3_no_feasible_reuse_100_percent_disposal(db_session):
    """3. No feasible reuse -> 100% disposal (MW-001 fails toxic and sulfate thresholds)"""
    req = OptimizationRequest(
        material_id="MW-001",
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert_strict_mass_balance(res)

    # 100% must go to disposal
    assert res.summary.total_diverted_tonnes == 0.0
    assert res.summary.total_disposed_tonnes == 4500.0
    assert res.summary.diversion_rate_pct == 0.0
    assert len(res.disposal_allocations) >= 1


def test_4_limited_destination_capacity(db_session):
    """4. Limited destination capacity bounds allocation"""
    custom_dests = [
        DestinationCreate(
            id="DEST-CAP-300",
            name="Cap 300 Cement Works",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=300.0,
            purchase_price_per_ton=40.0,
            location_name="Local Hub",
            latitude=17.65,
            longitude=75.90,
        )
    ]
    req = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    alloc = next((a for a in res.allocations if a.destination_id == "DEST-CAP-300"), None)
    assert alloc is not None
    assert alloc.delivered_tonnes == 300.0

    # Remainder sent to disposal
    assert res.summary.total_disposed_tonnes == 1850.0 - 300.0


def test_5_limited_processing_capacity(db_session):
    """5. Limited processing capacity bounds wet/coarse reclaimed ash throughput (FA-002 requires drying/grinding)"""
    # FA-002 is 3200t, requires DRYING and GRINDING
    # Restrict facility capacity to 800t
    custom_facs = [
        FacilityCreate(
            id="FAC-TINY",
            name="Limited Pilot Mill",
            process_types="DRYING,GRINDING",
            capacity_tonnes=800.0,
            processing_cost_per_ton=10.0,
            processing_yield=0.90,
            location_name="Pilot Park",
            latitude=21.2,
            longitude=79.1,
        )
    ]
    req = OptimizationRequest(
        material_id="FA-002",
        custom_facilities=custom_facs,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    # Total processed input must not exceed facility capacity 800t
    total_processed_input = sum(a.input_tonnes for a in res.allocations if a.processing_required)
    assert total_processed_input <= 800.0 + 1e-2


def test_6_processing_yield_and_residuals(db_session):
    """6. Processing yield: processed_output = input * yield, residual = input * (1 - yield)"""
    custom_facs = [
        FacilityCreate(
            id="FAC-YIELD-80",
            name="80% Yield Unit",
            process_types="DRYING,GRINDING",
            capacity_tonnes=1000.0,
            processing_cost_per_ton=15.0,
            processing_yield=0.80,  # 80% yield, 20% residual loss
            location_name="Plant Site",
            latitude=21.2,
            longitude=79.1,
        )
    ]
    custom_dests = [
        DestinationCreate(
            id="DEST-BULK",
            name="Bulk Cement Offtaker",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=5000.0,
            purchase_price_per_ton=50.0,
            location_name="Regional Buyer",
            latitude=21.3,
            longitude=79.2,
        )
    ]
    req = OptimizationRequest(
        material_id="FA-002",
        custom_facilities=custom_facs,
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    proc_alloc = next((a for a in res.allocations if a.processing_facility_id == "FAC-YIELD-80"), None)
    if proc_alloc:
        assert abs(proc_alloc.delivered_tonnes - (proc_alloc.input_tonnes * 0.80)) < 1e-2
        assert abs(proc_alloc.residual_tonnes - (proc_alloc.input_tonnes * 0.20)) < 1e-2


def test_7_transport_cost_influences_allocation(db_session):
    """7. Transport cost changes allocation: closer destination preferred over identical farther destination"""
    custom_dests = [
        DestinationCreate(
            id="DEST-FAR",
            name="Far Destination (800km)",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=1000.0,
            purchase_price_per_ton=30.0,
            location_name="Far Hub",
            latitude=25.0,
            longitude=85.0,  # very far
        ),
        DestinationCreate(
            id="DEST-NEAR",
            name="Near Destination (20km)",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=1000.0,
            purchase_price_per_ton=30.0,
            location_name="Near Hub",
            latitude=17.7,
            longitude=76.0,  # close to Solapur (17.65, 75.9)
        ),
    ]
    req = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    near_alloc = next((a for a in res.allocations if a.destination_id == "DEST-NEAR"), None)
    far_alloc = next((a for a in res.allocations if a.destination_id == "DEST-FAR"), None)

    assert near_alloc is not None
    assert near_alloc.delivered_tonnes == 1000.0  # Fills cheaper near destination first!


def test_8_processing_cost_influences_allocation(db_session):
    """8. Processing cost changes allocation: cheaper processing facility selected"""
    custom_facs = [
        FacilityCreate(
            id="FAC-CHEAP",
            name="Low-Cost Facility ($10/t)",
            process_types="DRYING,GRINDING",
            capacity_tonnes=500.0,
            processing_cost_per_ton=10.0,
            processing_yield=0.95,
            location_name="Cluster A",
            latitude=21.25,
            longitude=79.10,
        ),
        FacilityCreate(
            id="FAC-EXPENSIVE",
            name="Expensive Facility ($60/t)",
            process_types="DRYING,GRINDING",
            capacity_tonnes=500.0,
            processing_cost_per_ton=60.0,
            processing_yield=0.95,
            location_name="Cluster B",
            latitude=21.25,
            longitude=79.10,
        ),
    ]
    custom_dests = [
        DestinationCreate(
            id="DEST-CEM-ONLY",
            name="Cement Mill Offtaker",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=800.0,
            purchase_price_per_ton=50.0,
            location_name="Bhilai Suburb",
            latitude=21.25,
            longitude=79.20,
        )
    ]
    req = OptimizationRequest(
        material_id="FA-002",
        custom_facilities=custom_facs,
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    cheap_alloc = next((a for a in res.allocations if a.processing_facility_id == "FAC-CHEAP"), None)
    assert cheap_alloc is not None
    assert cheap_alloc.input_tonnes == 500.0  # Fully utilizes cheaper facility first


def test_9_revenue_value_influences_allocation(db_session):
    """9. Buyer purchase price / revenue influences destination priority"""
    custom_dests = [
        DestinationCreate(
            id="DEST-HIGH-PAY",
            name="Premium Buyer ($60/t)",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=800.0,
            purchase_price_per_ton=60.0,
            location_name="High Payer",
            latitude=17.7,
            longitude=76.0,
        ),
        DestinationCreate(
            id="DEST-LOW-PAY",
            name="Discount Buyer ($10/t)",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=800.0,
            purchase_price_per_ton=10.0,
            location_name="Low Payer",
            latitude=17.7,
            longitude=76.0,
        ),
    ]
    req = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)

    high_alloc = next((a for a in res.allocations if a.destination_id == "DEST-HIGH-PAY"), None)
    assert high_alloc is not None
    assert high_alloc.delivered_tonnes == 800.0  # Fully allocates to highest payer first!


def test_10_multiple_waste_streams_simultaneous_optimization(db_session):
    """10. Multiple waste streams optimized simultaneously"""
    req = OptimizationRequest(
        material_ids=["FA-001", "FA-002", "MW-001"],
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert_strict_mass_balance(res)

    expected_total = 1850.0 + 3200.0 + 4500.0
    assert abs(res.summary.total_input_tonnes - expected_total) < 1e-2


def test_11_zero_quantity_handling(db_session):
    """11. Zero quantity material stream handles gracefully without errors"""
    custom_mats = [
        {
            "id": "MAT-ZERO",
            "name": "Empty Silo Waste",
            "quantity_tonnes": 0.0,
            "latitude": 20.0,
            "longitude": 75.0,
            "location_name": "Terminal 0",
        }
    ]
    req = OptimizationRequest(
        custom_materials=custom_mats,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert res.summary.total_input_tonnes == 0.0
    assert res.summary.total_diverted_tonnes == 0.0
    assert res.summary.total_disposed_tonnes == 0.0
    assert_strict_mass_balance(res)


def test_12_deterministic_results(db_session):
    """12. Identical optimization requests produce identical deterministic allocations"""
    req = OptimizationRequest(
        material_id="FA-001",
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res1 = AllocationOptimizer.optimize(request=req, db=db_session)
    res2 = AllocationOptimizer.optimize(request=req, db=db_session)

    assert res1.summary.net_cost == res2.summary.net_cost
    assert res1.summary.total_diverted_tonnes == res2.summary.total_diverted_tonnes
    assert len(res1.allocations) == len(res2.allocations)


def test_13_multi_scenario_divergence(db_session):
    """13. Multi-objective scenarios: MAX_DIVERSION diverts more material than pure COST_MINIMIZATION if marginal cost > 0"""
    custom_dests = [
        DestinationCreate(
            id="DEST-EXPENSIVE-REUSE",
            name="Costly Reuse Site",
            pathway_id="CEMENTITIOUS",
            max_demand_tonnes=1000.0,
            purchase_price_per_ton=0.0,  # 0 revenue, transport costs $100/t > landfill $65/t
            location_name="Remote Mountain Site",
            latitude=27.0,
            longitude=86.0,
        )
    ]
    # Pure cost minimization will choose landfill ($65/t)
    req_cost = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res_cost = AllocationOptimizer.optimize(request=req_cost, db=db_session)

    # Max diversion gives strong credit to divert from landfill
    req_div = OptimizationRequest(
        material_id="FA-001",
        custom_destinations=custom_dests,
        scenario=ScenarioConfig(
            mode=ScenarioMode.MAX_DIVERSION,
            diversion_incentive_per_ton=150.0,  # Overcomes transport deficit
        ),
    )
    res_div = AllocationOptimizer.optimize(request=req_div, db=db_session)

    assert_strict_mass_balance(res_cost)
    assert_strict_mass_balance(res_div)

    # Max diversion diverts more than pure cost minimization
    assert res_div.summary.total_diverted_tonnes >= res_cost.summary.total_diverted_tonnes


def test_14_explainability_and_diagnostics(db_session):
    """14. Optimizer returns clear explainability audit trail and bottleneck detection"""
    req = OptimizationRequest(
        material_id="FA-001",
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)

    # Check explainability fields
    for alloc in res.allocations:
        assert alloc.explanation is not None
        assert len(alloc.explanation) > 0

    assert isinstance(res.facility_utilizations, list)
    assert isinstance(res.destination_utilizations, list)
    assert isinstance(res.diagnostics, list)


def test_15_member3_contract_integrity(db_session):
    """15. Validates exact contract data structure consumed by Member 3"""
    req = OptimizationRequest(
        material_id="FA-001",
        scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    m3 = res.member3_ledger_input

    assert m3.run_id.startswith("M3-LEDGER-")
    assert "total_baseline_tonnes" in m3.baseline_disposal
    assert isinstance(m3.reuse_allocations, list)
    assert isinstance(m3.disposal_allocations, list)
    assert isinstance(m3.processing_residuals, list)
    assert "net_cost" in m3.economic_ledger
    # Verify Member 2 did NOT calculate final emissions (no double counting)
    assert "net_carbon_avoided" not in m3.economic_ledger


def test_16_explicit_solver_types(db_session):
    """16. Test explicit solver selection across CP-SAT, Linear, and SciPy HiGHS"""
    solvers = [
        OptimizationSolverType.OR_TOOLS_CPSAT,
        OptimizationSolverType.OR_TOOLS_LINEAR,
        OptimizationSolverType.SCIPY_HIGHS,
    ]
    for s_type in solvers:
        req = OptimizationRequest(
            material_id="FA-001",
            scenario=ScenarioConfig(mode=ScenarioMode.COST_MINIMIZATION, solver_type=s_type),
        )
        res = AllocationOptimizer.optimize(request=req, db=db_session)
        assert res.status in ["OPTIMAL", "FEASIBLE"]
        assert_strict_mass_balance(res)


def test_17_missing_optional_information(db_session):
    """17. Missing optional fields (e.g. no scenario name, no transport rate, etc.)"""
    req = OptimizationRequest(
        material_id="FA-001",
        transport_rate_per_ton_km=None,
        scenario=ScenarioConfig(max_transport_distance_km=None),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert res.status == "OPTIMAL"
    assert_strict_mass_balance(res)


def test_18_disallow_disposal_infeasible_or_constrained(db_session):
    """18. When disposal is disallowed, all material must be diverted if feasible"""
    req = OptimizationRequest(
        material_id="FA-001",
        disallow_disposal=True,
        scenario=ScenarioConfig(mode=ScenarioMode.MAX_DIVERSION),
    )
    res = AllocationOptimizer.optimize(request=req, db=db_session)
    assert_strict_mass_balance(res)
    # When disposal is disallowed, direct disposal should be 0
    assert len(res.disposal_allocations) == 0
    assert res.summary.total_disposed_tonnes == 0.0
