from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class EconomicLedger(BaseModel):
    # Baseline Scenario (100% standard disposal)
    baseline_disposal_gate_fee_usd: float
    baseline_transport_cost_usd: float
    baseline_total_cost_usd: float
    baseline_unit_cost_usd_per_ton: float

    # Optimized Scenario (Multi-route reuse + residual handling)
    optimized_gate_fees_usd: float
    optimized_transport_cost_usd: float
    optimized_processing_cost_usd: float
    optimized_residual_handling_cost_usd: float
    optimized_offtake_revenue_credit_usd: float
    optimized_total_net_cost_usd: float
    optimized_unit_net_cost_usd_per_ton: float

    # Cost Delta
    net_cost_savings_usd: float
    cost_reduction_percentage: float
    return_on_diverted_ton_usd: float


class EmissionScopeBreakdown(BaseModel):
    scope_1_processing_direct_kg_co2e: float = Field(
        default=0.0,
        description="Direct thermal/chemical emissions at processing facility"
    )
    scope_2_electricity_indirect_kg_co2e: float = Field(
        default=0.0,
        description="Emissions from electricity consumed during pre-treatment/processing"
    )
    scope_3_transport_kg_co2e: float = Field(
        default=0.0,
        description="Freight haulage emissions from generator to facilities"
    )
    scope_3_residual_disposal_kg_co2e: float = Field(
        default=0.0,
        description="Downstream disposal emissions of unrecovered process residues"
    )


class DisplacementAuditEntry(BaseModel):
    """Auditable trace for avoided virgin material displacement."""
    pathway: str
    replaces_material: str  # e.g., "Ordinary Portland Cement (Clinker)", "Crushed Virgin Gravel"
    substitution_ratio: float = Field(
        description="Tons of virgin material displaced per ton of recovered product"
    )
    virgin_embodied_carbon_kg_co2e_per_ton: float
    recovered_product_tons: float
    gross_avoided_kg_co2e: float
    displacement_factor: float = Field(
        default=1.0, ge=0.0, le=1.0,
        description="Market displacement / elasticity factor to prevent over-crediting"
    )
    net_avoided_kg_co2e: float
    justification_source: str


class EnvironmentalLedger(BaseModel):
    # Baseline Scenario Emissions
    baseline_landfill_methane_fugitive_kg_co2e: float
    baseline_transport_kg_co2e: float
    baseline_gross_emissions_kg_co2e: float

    # Optimized Scenario Operational Emissions (Gross)
    operational_emissions: EmissionScopeBreakdown
    gross_operational_emissions_kg_co2e: float

    # Counterfactual Avoided Emissions (Segregated)
    avoided_virgin_displacements: List[DisplacementAuditEntry]
    total_avoided_virgin_emissions_kg_co2e: float

    # Net Footprint & Change vs Baseline
    optimized_net_footprint_kg_co2e: float = Field(
        description="Gross operational emissions minus verified avoided virgin emissions"
    )
    net_carbon_abatement_kg_co2e: float = Field(
        description="Baseline gross emissions minus optimized net footprint"
    )
    abatement_percentage: float
    abatement_intensity_kg_co2e_per_ton: float

    # Anti-Double-Counting Guardrails
    double_counting_audit_passed: bool = Field(
        default=True,
        description="True if avoided credits strictly match physical mass balance and have no overlapping claims"
    )
    audit_notes: List[str] = Field(default_factory=list)


class DecisionSummaryReport(BaseModel):
    stream_id: str
    total_tonnage: float
    circular_diversion_pct: float
    economic_ledger: EconomicLedger
    environmental_ledger: EnvironmentalLedger
    executive_recommendation: str
    break_even_distance_km: Optional[float] = None
    shadow_carbon_price_impact: Optional[Dict[str, float]] = None
