# RE:FLOW-X — Member 3: Economic & Environmental Impact Ledger

## 1. Baseline Definition

The baseline scenario represents the outcome if the entire available byproduct or waste stream followed its conventional disposal pathway (e.g., landfilling). It serves as the point of reference against which all optimized circular (reuse) pathways are compared. 

- **Economic Baseline**: `quantity × disposal_gate_fee`
- **Environmental Baseline**: `quantity × disposal_emission_factor`

## 2. Optimized Scenario

The optimized scenario represents the multi-destination allocation created by the Member 2 Optimizer. This may include direct reuse, processed reuse, and partial disposal for residuals or uneconomic flows.

The total inputs must strictly balance against outputs:
`input_quantity = reuse_quantity + residual_disposal_quantity + direct_disposal_quantity`

## 3. Economic Equations

The economic ledger summarizes the cost components of the optimized plan:
- **Transport Cost**: Provided by the optimizer.
- **Processing Cost**: Provided by the optimizer.
- **Disposal Cost**: Provided by the optimizer.
- **Revenue**: Provided by the optimizer.
- **Net Cost**: `Transport Cost + Processing Cost + Disposal Cost - Revenue`
- **Cost Difference**: `Net Cost - Baseline Disposal Cost`

## 4. Environmental Equations

The environmental ledger systematically categorizes emissions. The primary equation for net impact is:

`net_emissions_change = optimized_emissions - baseline_disposal_emissions`

If a substitution credit is applied (avoided virgin production):
`net_emissions_change = optimized_emissions - baseline_disposal_emissions - avoided_production_credit`

## 5. Transport Calculation

`transport_emissions = delivered_quantity × transport_distance_km × transport_emission_factor`

## 6. Processing Calculation

`processing_emissions = input_quantity × processing_emission_factor`

## 7. Disposal Calculation

`disposal_emissions = disposal_quantity × disposal_emission_factor`

## 8. Optional Substitution Credit

For specific materials substituting virgin products (e.g., fly ash displacing Portland Cement), a credit may be calculated if well-documented:
`avoided_production_credit = delivered_quantity × virgin_displacement_ratio × avoided_production_emission_factor`

This is subtracted from the net emissions change if explicitly enabled in the accounting mode.

## 9. No-Double-Counting Rule

This ledger strictly enforces the principle of non-overlapping impact scopes:
- A material sent to reuse is **not** counted as disposed.
- The original disposal that was "avoided" is calculated exactly once as the baseline point of comparison. 
- You cannot claim "avoided emissions" and simultaneously count the same volume as having zero disposal footprint without explicitly subtracting it from the baseline.

## 10. Accounting Modes

The API supports three operational modes:
1. `PHYSICAL_ONLY`: Tracks only the physical movement and processing (transport, processing, disposal). Substitution credits are zeroed out.
2. `SUBSTITUTION_CREDIT`: Includes the avoided conventional production credit.
3. `FULL_LEDGER`: Comprehensive mode utilizing all available documented terms.

## 11. Units

- Quantities: Tonnes (t)
- Distance: Kilometers (km)
- Costs: USD ($)
- Emissions: Tonnes of CO2 equivalent (tCO2e)
- Emission Factors: kg CO2e / tonne (or per t-km for transport)

## 12. Factor Provenance

All factors used by Member 3 are mapped via a structured Factor Registry. Each entry in the environmental ledger includes a `factor_source` to provide traceability to the standard (e.g., EPA GHG Emission Factors Hub 2023, DEFRA, WBCSD). 

## 13. Missing-Factor Handling

If an emission factor is missing, the ledger flags it in the `missing_factors` list and outputs a diagnostic warning. The calculation does not silently use zero for missing data. 

## 14. Example Calculation

Given 1,000 tonnes of material:

**Baseline:**
- 1,000 t × 480 kg CO2e/t = 480 tCO2e

**Optimized (Processing + Reuse + Residual):**
- 900 t delivered to reuse over 100 km using diesel truck (EF 0.092)
  - Transport = 900 × 100 × 0.092 / 1000 = 8.28 tCO2e
- 1,000 t processed (EF 15.0)
  - Processing = 1,000 × 15.0 / 1000 = 15.0 tCO2e
- 100 t residual disposal (EF 480.0)
  - Residual Disposal = 100 × 480.0 / 1000 = 48.0 tCO2e
- Total Optimized Emissions = 8.28 + 15.0 + 48.0 = 71.28 tCO2e

**Net Change:**
`71.28 (Optimized) - 480.0 (Baseline) = -408.72 tCO2e` (a net reduction).
