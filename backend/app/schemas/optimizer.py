from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class TransportMode(str, Enum):
    TRUCK_DIESEL = "TRUCK_DIESEL"
    RAIL_FREIGHT = "RAIL_FREIGHT"
    TRUCK_ELECTRIC = "TRUCK_ELECTRIC"


class ScenarioMode(str, Enum):
    COST_MINIMIZATION = "COST_MINIMIZATION"
    MAX_DIVERSION = "MAX_DIVERSION"
    BALANCED = "BALANCED"
    CUSTOM = "CUSTOM"


class OptimizationSolverType(str, Enum):
    OR_TOOLS_CPSAT = "OR_TOOLS_CPSAT"
    OR_TOOLS_LINEAR = "OR_TOOLS_LINEAR"
    SCIPY_HIGHS = "SCIPY_HIGHS"


class AllocationStatus(str, Enum):
    ALLOCATED = "ALLOCATED"
    CAPACITY_BOUND = "CAPACITY_BOUND"
    DEMAND_BOUND = "DEMAND_BOUND"
    PROCESSING_CAPACITY_BOUND = "PROCESSING_CAPACITY_BOUND"
    INFEASIBLE_QUALITY = "INFEASIBLE_QUALITY"
    UNKNOWN_EVIDENCE = "UNKNOWN_EVIDENCE"
    UNECONOMIC = "UNECONOMIC"
    ZERO_ALLOCATION = "ZERO_ALLOCATION"


# -------------------------------------------------------------
# Entity Input / Response Schemas
# -------------------------------------------------------------

class FacilityBase(BaseModel):
    name: str
    process_types: str  # Comma-separated, e.g. "DRYING,GRINDING"
    capacity_tonnes: float = Field(..., gt=0)
    processing_cost_per_ton: float = Field(default=15.0, ge=0)
    processing_yield: float = Field(default=0.95, gt=0.0, le=1.0)
    energy_kwh_per_ton: float = Field(default=35.0, ge=0)
    emissions_factor_kg_co2e_per_ton: float = Field(default=15.0, ge=0)
    location_name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_active: bool = True
    description: Optional[str] = None


class FacilityCreate(FacilityBase):
    id: str


class FacilityResponse(FacilityBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class DestinationBase(BaseModel):
    name: str
    pathway_id: str
    max_demand_tonnes: float = Field(..., gt=0)
    min_demand_tonnes: float = Field(default=0.0, ge=0)
    purchase_price_per_ton: float = Field(default=25.0, ge=0)
    location_name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_active: bool = True
    description: Optional[str] = None


class DestinationCreate(DestinationBase):
    id: str


class DestinationResponse(DestinationBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class DisposalSiteBase(BaseModel):
    name: str
    disposal_type: str = "LANDFILL"
    gate_fee_per_ton: float = Field(default=75.0, ge=0)
    capacity_tonnes: float = Field(default=100000.0, gt=0)
    location_name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    is_active: bool = True
    description: Optional[str] = None


class DisposalSiteCreate(DisposalSiteBase):
    id: str


class DisposalSiteResponse(DisposalSiteBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Scenario & Optimization Configuration
# -------------------------------------------------------------

class ScenarioConfig(BaseModel):
    mode: ScenarioMode = ScenarioMode.COST_MINIMIZATION
    name: str = "Default Cost Minimization"
    description: Optional[str] = "Minimizes total net cost (transport + processing + disposal - revenue)"
    diversion_incentive_per_ton: float = Field(default=0.0, ge=0.0)
    carbon_tax_proxy_per_kg_co2e: float = Field(default=0.0, ge=0.0)
    cost_weight: float = Field(default=1.0, ge=0.0)
    diversion_weight: float = Field(default=0.0, ge=0.0)
    max_transport_distance_km: Optional[float] = Field(default=None, gt=0)
    solver_type: OptimizationSolverType = OptimizationSolverType.OR_TOOLS_CPSAT


class OptimizationRequest(BaseModel):
    material_id: Optional[str] = None
    material_ids: Optional[List[str]] = None
    # Support direct in-memory custom data for what-if sandboxes
    custom_materials: Optional[List[Dict[str, Any]]] = None
    custom_facilities: Optional[List[FacilityCreate]] = None
    custom_destinations: Optional[List[DestinationCreate]] = None
    custom_disposal_sites: Optional[List[DisposalSiteCreate]] = None
    transport_mode: TransportMode = TransportMode.TRUCK_DIESEL
    transport_rate_per_ton_km: Optional[float] = Field(default=None, gt=0)
    scenario: ScenarioConfig = Field(default_factory=ScenarioConfig)
    disallow_disposal: bool = False

    @field_validator("custom_materials")
    @classmethod
    def validate_custom_materials(cls, v):
        if v:
            for m in v:
                if m.get("quantity_tonnes", 0) < 0:
                    raise ValueError("Material quantity_tonnes must not be negative.")
        return v


# -------------------------------------------------------------
# Solution Outputs & Contracts
# -------------------------------------------------------------

class AllocationFlow(BaseModel):
    allocation_id: str
    material_id: str
    material_name: str
    source_location: str
    source_coords: List[float]
    pathway_id: str
    destination_id: str
    destination_name: str
    destination_location: str
    destination_coords: List[float]
    processing_required: bool
    processing_facility_id: Optional[str] = None
    processing_facility_name: Optional[str] = None
    processing_coords: Optional[List[float]] = None
    required_remedies: List[str] = Field(default_factory=list)
    input_tonnes: float
    delivered_tonnes: float
    residual_tonnes: float
    processing_yield: float
    distance_km: float
    transport_mode: str
    transport_cost: float
    processing_cost: float
    revenue: float
    net_cost: float
    status: AllocationStatus
    feasibility_status: str
    explanation: str


class DisposalAllocationFlow(BaseModel):
    material_id: str
    material_name: str
    source_location: str
    source_coords: List[float]
    disposal_facility_id: str
    disposal_facility_name: str
    disposal_location: str
    disposal_coords: List[float]
    quantity_tonnes: float
    distance_km: float
    transport_cost: float
    gate_fee: float
    total_cost: float
    reason: str


class FacilityUtilization(BaseModel):
    facility_id: str
    facility_name: str
    capacity_tonnes: float
    allocated_tonnes: float
    utilization_pct: float
    is_binding: bool
    status: str  # NORMAL, WARNING, CRITICAL


class DestinationUtilization(BaseModel):
    destination_id: str
    destination_name: str
    pathway_id: str
    max_demand_tonnes: float
    min_demand_tonnes: float = 0.0
    allocated_tonnes: float
    utilization_pct: float
    is_binding: bool
    status: str  # UNMET, SATISFIED, SATURATED


class BottleneckAlert(BaseModel):
    id: str
    title: str
    facility: str
    utilization: float
    status: str  # "warning" | "critical" | "info"
    description: str


class BindingConstraint(BaseModel):
    constraint_type: str
    entity_id: str
    limit_value: float
    actual_value: float
    impact_description: str


class OptimizationSummary(BaseModel):
    total_input_tonnes: float
    total_diverted_tonnes: float
    total_disposed_tonnes: float
    total_residual_tonnes: float
    diversion_rate_pct: float
    total_transport_cost: float
    total_processing_cost: float
    total_disposal_cost: float
    total_revenue: float
    net_cost: float
    baseline_disposal_only_cost: float
    net_savings_vs_baseline: float
    mass_balance_verified: bool
    mass_balance_discrepancy: float


# Member 3 & Frontend Special Contracts

class Member3LedgerInput(BaseModel):
    """
    STABLE INTEGRATION CONTRACT FOR MEMBER 3 (Economic + Environmental Impact Ledger).
    Member 2 provides pure physical/economic allocations and factors without calculating
    final avoided emissions or LCA accounting (strictly avoiding double counting).
    """
    run_id: str
    scenario_mode: str
    baseline_disposal: Dict[str, Any]
    reuse_allocations: List[Dict[str, Any]]
    disposal_allocations: List[Dict[str, Any]]
    processing_residuals: List[Dict[str, Any]]
    economic_ledger: Dict[str, float]


class FrontendSankeyFlow(BaseModel):
    id: str
    sourceMaterial: str
    pathway: str
    destination: str
    tonnes: float
    color: str


class FrontendNetworkRoute(BaseModel):
    id: str
    sourceId: str
    sourceName: str
    processingId: Optional[str] = None
    processingName: Optional[str] = None
    destinationId: str
    destinationName: str
    materialId: str
    materialName: str
    quantity: float
    distanceKm: float
    transportCost: float
    processingCost: float
    yieldPercentage: float
    residualTonnes: float
    technicallyFeasible: bool
    capacityAvailable: bool
    demandAvailable: bool
    routeCoordinates: List[List[float]]
    status: str


class OptimizationResponse(BaseModel):
    status: str  # "OPTIMAL", "FEASIBLE", "INFEASIBLE", "ERROR"
    solver_used: str
    solve_time_ms: float
    scenario: ScenarioConfig
    summary: OptimizationSummary
    allocations: List[AllocationFlow]
    disposal_allocations: List[DisposalAllocationFlow]
    facility_utilizations: List[FacilityUtilization]
    destination_utilizations: List[DestinationUtilization]
    bottlenecks: List[BottleneckAlert]
    binding_constraints: List[BindingConstraint]
    member3_ledger_input: Member3LedgerInput
    frontend_sankey_flows: List[FrontendSankeyFlow]
    frontend_network_routes: List[FrontendNetworkRoute]
    diagnostics: List[str]


class ScenarioComparisonItem(BaseModel):
    scenario_mode: str
    scenario_name: str
    diverted_tonnes: float
    disposed_tonnes: float
    diversion_rate_pct: float
    net_cost: float
    total_transport_cost: float
    total_processing_cost: float
    total_revenue: float
    bottlenecks_count: int


class ScenarioComparisonResponse(BaseModel):
    material_id: Optional[str]
    scenarios: List[ScenarioComparisonItem]
