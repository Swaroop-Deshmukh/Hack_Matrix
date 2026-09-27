from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AccountingMode(str, Enum):
    PHYSICAL_ONLY = "PHYSICAL_ONLY"
    SUBSTITUTION_CREDIT = "SUBSTITUTION_CREDIT"
    FULL_LEDGER = "FULL_LEDGER"


class EconomicCategory(str, Enum):
    TRANSPORT = "TRANSPORT"
    PROCESSING = "PROCESSING"
    DISPOSAL = "DISPOSAL"
    REVENUE = "REVENUE"
    OTHER = "OTHER"


class EnvironmentalCategory(str, Enum):
    BASELINE_DISPOSAL = "BASELINE_DISPOSAL"
    TRANSPORT = "TRANSPORT"
    PROCESSING = "PROCESSING"
    RESIDUAL_DISPOSAL = "RESIDUAL_DISPOSAL"
    REUSE = "REUSE"
    AVOIDED_PRODUCTION = "AVOIDED_PRODUCTION"


class EconomicLedgerEntry(BaseModel):
    material_id: Optional[str] = None
    allocation_id: Optional[str] = None
    category: EconomicCategory
    quantity: float
    unit: str
    unit_cost: float
    total_cost: float
    source: str
    scenario: str
    description: Optional[str] = None


class EnvironmentalLedgerEntry(BaseModel):
    material_id: Optional[str] = None
    allocation_id: Optional[str] = None
    category: EnvironmentalCategory
    activity_quantity: float
    activity_unit: str
    emission_factor: float
    factor_unit: str
    emissions: float
    emissions_unit: str
    factor_source: str
    accounting_mode: AccountingMode
    scenario: str
    description: Optional[str] = None


class BaselineImpact(BaseModel):
    quantity: float
    disposal_cost: float
    disposal_emissions: float


class OptimizedImpact(BaseModel):
    reuse_quantity: float
    disposal_quantity: float
    transport_cost: float
    processing_cost: float
    disposal_cost: float
    reuse_value: float
    total_cost: float
    transport_emissions: float
    processing_emissions: float
    residual_disposal_emissions: float
    avoided_production_emissions: Optional[float] = None
    total_optimized_emissions: float


class ImpactComparison(BaseModel):
    diverted_waste: float
    diversion_percentage: Optional[float] = None
    cost_difference: float
    emissions_difference: float
    emissions_change_percentage: Optional[float] = None


class ImpactMethodology(BaseModel):
    formula: str
    accounting_mode: AccountingMode
    description: str


class ImpactResponse(BaseModel):
    baseline: BaselineImpact
    optimized: OptimizedImpact
    comparison: ImpactComparison
    economic_ledger: List[EconomicLedgerEntry]
    environmental_ledger: List[EnvironmentalLedgerEntry]
    methodology: List[ImpactMethodology]
    factor_sources: List[str]
    missing_factors: List[str]
    assumptions: List[str]
    warnings: List[str]
    accounting_mode: AccountingMode

class ImpactCalculateRequest(BaseModel):
    member3_ledger_input: Dict[str, Any]
    accounting_mode: AccountingMode = AccountingMode.PHYSICAL_ONLY
    
