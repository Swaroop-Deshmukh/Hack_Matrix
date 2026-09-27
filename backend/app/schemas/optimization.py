from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from .waste import WasteStreamInput
from .feasibility import ReusePathway, FeasibilityReport
from .facility import DestinationFacility


class TransportMode(str, Enum):
    HEAVY_DUTY_DIESEL_TRUCK = "heavy_duty_diesel_truck"
    ELECTRIC_FREIGHT_TRUCK = "electric_freight_truck"
    FREIGHT_RAIL = "freight_rail"


class ObjectiveWeights(BaseModel):
    cost_weight: float = Field(default=1.0, ge=0.0, description="Weight for economic cost minimization")
    carbon_weight: float = Field(default=0.0, ge=0.0, description="Weight for carbon emissions minimization (or $/ton carbon tax)")
    landfill_diversion_weight: float = Field(default=0.0, ge=0.0, description="Priority weight to incentivize circular diversion")


class TransportParameters(BaseModel):
    mode: TransportMode = TransportMode.HEAVY_DUTY_DIESEL_TRUCK
    freight_rate_usd_per_ton_km: float = Field(default=0.14, gt=0.0)
    emission_factor_kg_co2e_per_ton_km: float = Field(default=0.092, gt=0.0)


class AllocationRoute(BaseModel):
    facility_id: str
    facility_name: str
    pathway: ReusePathway
    is_disposal: bool
    allocated_quantity_tons: float
    distance_km: float
    
    # Financial breakdown ($)
    transport_cost_usd: float
    gate_fee_usd: float
    processing_cost_usd: float
    residual_disposal_cost_usd: float
    offtake_revenue_credit_usd: float
    net_cost_usd: float
    unit_cost_usd_per_ton: float
    
    # Material mass balance (tons)
    recovered_product_tons: float
    residual_waste_tons: float


class OptimizationRequest(BaseModel):
    waste_stream: WasteStreamInput
    feasibility_report: Optional[FeasibilityReport] = None
    candidate_facilities: Optional[List[DestinationFacility]] = None
    transport_params: TransportParameters = Field(default_factory=TransportParameters)
    weights: ObjectiveWeights = Field(default_factory=ObjectiveWeights)
    carbon_price_usd_per_ton: float = Field(default=0.0, ge=0.0)
    allow_split_allocation: bool = Field(default=True, description="Allow splitting waste across multiple destinations")


class OptimizationResult(BaseModel):
    stream_id: str
    total_waste_tons: float
    solver_status: str  # OPTIMAL, FEASIBLE, INFEASIBLE
    objective_value: float
    solve_time_seconds: float
    allocations: List[AllocationRoute]
    
    # Circularity summary
    circular_diversion_rate_pct: float = Field(ge=0.0, le=100.0)
    disposed_waste_tons: float
    diverted_waste_tons: float
