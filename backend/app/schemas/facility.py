from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from .waste import Location
from .feasibility import ReusePathway


class DestinationType(str, Enum):
    CEMENT_PLANT = "cement_plant"
    CONCRETE_BATCHING = "concrete_batching_plant"
    ROAD_CONTRACTOR_DEPOT = "road_contractor_depot"
    GEOPOLYMER_FABRICATOR = "geopolymer_fabricator"
    ENGINEERED_LANDFILL = "engineered_landfill"
    HAZARDOUS_INCINERATOR = "hazardous_incinerator"


class DestinationFacility(BaseModel):
    facility_id: str
    name: str
    destination_type: DestinationType
    supported_pathways: List[ReusePathway]
    location: Location
    
    # Capacity & operational constraints
    monthly_intake_capacity_tons: float = Field(..., gt=0.0)
    current_utilized_capacity_tons: float = Field(default=0.0, ge=0.0)
    min_batch_size_tons: float = Field(default=10.0, ge=0.0)
    
    # Economics ($ / metric ton)
    gate_fee_usd_per_ton: float = Field(
        ...,
        description="Gate/tipping fee charged to waste generator (negative if facility buys material)"
    )
    processing_cost_usd_per_ton: float = Field(default=0.0, ge=0.0)
    
    # Processing yield and residuals
    recovery_yield_ratio: float = Field(
        default=0.90, ge=0.0, le=1.0,
        description="Fraction of input converted into useful circular product"
    )
    residual_disposal_cost_usd_per_ton: float = Field(default=45.0, ge=0.0)
    
    # Energy and emissions
    electricity_kwh_per_ton: float = Field(default=25.0, ge=0.0)
    thermal_mj_per_ton: float = Field(default=0.0, ge=0.0)
    
    # Product offtake
    offtake_product_name: Optional[str] = None
    offtake_market_value_usd_per_ton: float = Field(default=0.0, ge=0.0)
