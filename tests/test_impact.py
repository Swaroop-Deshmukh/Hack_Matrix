import pytest
from backend.app.schemas.impact import ImpactCalculateRequest, AccountingMode
from backend.app.engine.impact import ImpactCalculator

@pytest.fixture
def calculator():
    return ImpactCalculator()

@pytest.fixture
def base_ledger_input():
    return {
        "run_id": "test_1",
        "scenario_mode": "COST_MINIMIZATION",
        "baseline_disposal": {
            "total_baseline_tonnes": 1000.0,
            "disposal_type": "LANDFILL",
            "default_gate_fee_usd_per_ton": 75.0,
            "baseline_emission_factor_kg_co2e_per_ton": 480.0
        },
        "reuse_allocations": [],
        "disposal_allocations": [],
        "processing_residuals": [],
        "economic_ledger": {
            "transport_cost": 0.0,
            "processing_cost": 0.0,
            "disposal_cost": 0.0,
            "revenue": 0.0,
            "net_cost": 0.0
        }
    }

def test_baseline_disposal_cost_and_emissions(calculator, base_ledger_input):
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 1. Baseline disposal cost
    assert res.baseline.disposal_cost == 75000.0
    # 4. Baseline disposal emissions (1000 * 480 / 1000 = 480)
    assert res.baseline.disposal_emissions == 480.0

def test_optimized_reuse_cost_and_comparison(calculator, base_ledger_input):
    base_ledger_input["economic_ledger"]["transport_cost"] = 10000.0
    base_ledger_input["economic_ledger"]["processing_cost"] = 5000.0
    base_ledger_input["economic_ledger"]["revenue"] = 50000.0
    base_ledger_input["economic_ledger"]["net_cost"] = -35000.0
    
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 2. Optimized reuse cost
    assert res.optimized.total_cost == -35000.0
    assert res.optimized.transport_cost == 10000.0
    
    # 3. Cost comparison
    assert res.comparison.cost_difference == -110000.0  # -35000 - 75000

def test_transport_and_processing_emissions(calculator, base_ledger_input):
    base_ledger_input["reuse_allocations"].append({
        "allocation_id": "alloc_1",
        "material_id": "mat_1",
        "input_tonnes": 1000.0,
        "delivered_tonnes": 900.0,
        "transport_distance_km": 100.0,
        "transport_mode": "TRUCK_DIESEL",
        "processing_required": True,
        "virgin_displacement_ratio": 1.0
    })
    base_ledger_input["processing_residuals"].append({
        "material_id": "mat_1",
        "allocation_id": "alloc_1",
        "residual_tonnes": 100.0
    })
    
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 5. Transport emissions: 900 t * 100 km * 0.092 EF / 1000 = 8.28 tCO2e
    assert round(res.optimized.transport_emissions, 2) == 8.28
    
    # 6. Processing emissions: 1000 t * 15.0 EF / 1000 = 15.0 tCO2e
    assert round(res.optimized.processing_emissions, 2) == 15.0
    
    # 7. Residual disposal emissions: 100 t * 480.0 EF / 1000 = 48.0 tCO2e
    assert round(res.optimized.residual_disposal_emissions, 2) == 48.0

    # 16. Processing yield < 100%
    # Delivered = 900, Residual = 100, Input = 1000
    assert res.optimized.reuse_quantity == 900.0
    assert res.optimized.disposal_quantity == 100.0

def test_diversion_calculation(calculator, base_ledger_input):
    base_ledger_input["reuse_allocations"].append({
        "delivered_tonnes": 500.0,
        "transport_distance_km": 0.0
    })
    base_ledger_input["disposal_allocations"].append({
        "quantity_tonnes": 500.0
    })
    
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 8. Diversion calculation
    assert res.comparison.diverted_waste == 500.0
    assert res.comparison.diversion_percentage == 50.0

def test_zero_quantity(calculator, base_ledger_input):
    base_ledger_input["baseline_disposal"]["total_baseline_tonnes"] = 0.0
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 10. Zero quantity
    assert res.baseline.quantity == 0.0
    assert res.baseline.disposal_cost == 0.0
    assert res.baseline.disposal_emissions == 0.0
    assert res.comparison.diversion_percentage == 0.0

def test_missing_emission_factor(calculator, base_ledger_input):
    base_ledger_input["reuse_allocations"].append({
        "delivered_tonnes": 100.0,
        "transport_distance_km": 100.0,
        "transport_mode": "UNKNOWN_MODE"
    })
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    # 11. Missing emission factor
    assert "Transport EF for UNKNOWN_MODE" in res.missing_factors
    assert res.optimized.transport_emissions == 0.0

def test_substitution_credit_modes(calculator, base_ledger_input):
    base_ledger_input["reuse_allocations"].append({
        "delivered_tonnes": 1000.0,
        "transport_distance_km": 100.0,
        "virgin_displacement_ratio": 1.0
    })
    
    req_physical = ImpactCalculateRequest(
        member3_ledger_input=base_ledger_input,
        accounting_mode=AccountingMode.PHYSICAL_ONLY
    )
    res_physical = calculator.calculate(req_physical)
    
    # 13. Substitution credit disabled
    assert res_physical.optimized.avoided_production_emissions is None
    
    req_full = ImpactCalculateRequest(
        member3_ledger_input=base_ledger_input,
        accounting_mode=AccountingMode.SUBSTITUTION_CREDIT
    )
    res_full = calculator.calculate(req_full)
    
    # 14. Substitution credit enabled
    # 1000 t * 1.0 * 850.0 EF / 1000 = 850 tCO2e
    assert res_full.optimized.avoided_production_emissions == 850.0

def test_critical_no_double_counting(calculator, base_ledger_input):
    # Step 29: baseline disposal is not simultaneously counted as optimized disposal
    base_ledger_input["reuse_allocations"].append({
        "delivered_tonnes": 1000.0,
        "transport_distance_km": 100.0,
        "transport_mode": "TRUCK_DIESEL",
    })
    
    req = ImpactCalculateRequest(
        member3_ledger_input=base_ledger_input,
        accounting_mode=AccountingMode.PHYSICAL_ONLY
    )
    res = calculator.calculate(req)
    
    # Optimized total should only include transport (since no processing, no residual)
    assert res.optimized.total_optimized_emissions == res.optimized.transport_emissions
    assert res.optimized.residual_disposal_emissions == 0.0
    
    # Check ledgers to ensure no disposal term in optimized system
    env_ledger = res.environmental_ledger
    baseline_entries = [e for e in env_ledger if e.scenario == "BASELINE"]
    opt_entries = [e for e in env_ledger if e.scenario == "OPTIMIZED"]
    
    assert len(baseline_entries) == 1
    assert baseline_entries[0].category == "BASELINE_DISPOSAL"
    
    # Only transport in OPTIMIZED
    assert len(opt_entries) == 1
    assert opt_entries[0].category == "TRANSPORT"

def test_accounting_equation(calculator, base_ledger_input):
    # Step 30: Accounting equation test
    base_ledger_input["reuse_allocations"].append({
        "input_tonnes": 1000.0,
        "delivered_tonnes": 900.0,
        "transport_distance_km": 100.0,
        "transport_mode": "TRUCK_DIESEL",
        "processing_required": True,
        "virgin_displacement_ratio": 1.0
    })
    base_ledger_input["processing_residuals"].append({
        "residual_tonnes": 100.0
    })
    
    req = ImpactCalculateRequest(
        member3_ledger_input=base_ledger_input,
        accounting_mode=AccountingMode.FULL_LEDGER
    )
    res = calculator.calculate(req)
    
    opt_emissions = res.optimized.transport_emissions + res.optimized.processing_emissions + res.optimized.residual_disposal_emissions
    assert res.optimized.total_optimized_emissions == opt_emissions
    
    expected_net = opt_emissions - res.baseline.disposal_emissions - res.optimized.avoided_production_emissions
    assert res.comparison.emissions_difference == expected_net

def test_multiple_allocations_and_destinations(calculator, base_ledger_input):
    # 17. Multiple destinations
    # 18. Multiple allocations
    base_ledger_input["reuse_allocations"].extend([
        {
            "delivered_tonnes": 200.0,
            "transport_distance_km": 50.0,
        },
        {
            "delivered_tonnes": 300.0,
            "transport_distance_km": 100.0,
        }
    ])
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    assert res.optimized.reuse_quantity == 500.0
    
def test_full_disposal_scenario(calculator, base_ledger_input):
    # 19. Full disposal scenario
    base_ledger_input["disposal_allocations"].append({
        "quantity_tonnes": 1000.0
    })
    req = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res = calculator.calculate(req)
    
    assert res.optimized.reuse_quantity == 0.0
    assert res.optimized.disposal_quantity == 1000.0
    assert res.optimized.residual_disposal_emissions == 480.0
    assert res.comparison.diverted_waste == 0.0
    assert res.comparison.diversion_percentage == 0.0

def test_deterministic_calculation(calculator, base_ledger_input):
    # 22. Deterministic calculation
    req1 = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res1 = calculator.calculate(req1)
    req2 = ImpactCalculateRequest(member3_ledger_input=base_ledger_input)
    res2 = calculator.calculate(req2)
    
    assert res1.model_dump() == res2.model_dump()
