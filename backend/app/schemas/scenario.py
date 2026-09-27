from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from .waste import WasteStreamInput
from .optimization import ObjectiveWeights, TransportParameters
from .ledger import DecisionSummaryReport


class ScenarioParameterOverrides(BaseModel):
    scenario_name: str
    description: Optional[str] = None
    
    # Cost & economic shocks
    diesel_fuel_price_multiplier: float = Field(default=1.0, gt=0.0)
    gate_fee_multiplier: float = Field(default=1.0, gt=0.0)
    carbon_tax_usd_per_ton_co2e: float = Field(default=0.0, ge=0.0)
    
    # Capacity shocks / outages
    facility_capacity_multipliers: Dict[str, float] = Field(default_factory=dict)
    
    # Pre-treatment activation
    apply_thermal_drying: bool = Field(default=False)
    apply_magnetic_separation: bool = Field(default=False)
    
    # Solver weight overrides
    weights: Optional[ObjectiveWeights] = None


class ScenarioComparisonResponse(BaseModel):
    base_scenario: DecisionSummaryReport
    modified_scenario: DecisionSummaryReport
    
    # Differential KPIs
    delta_cost_usd: float
    delta_carbon_kg_co2e: float
    delta_diversion_pct: float
    sensitivity_insights: List[str]
