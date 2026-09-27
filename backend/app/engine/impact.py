from typing import List, Dict, Any, Tuple
from backend.app.schemas.impact import (
    ImpactCalculateRequest, ImpactResponse, BaselineImpact, OptimizedImpact,
    ImpactComparison, EconomicLedgerEntry, EnvironmentalLedgerEntry,
    EconomicCategory, EnvironmentalCategory, AccountingMode, ImpactMethodology
)
from backend.app.schemas.optimizer import Member3LedgerInput
from backend.app.engine.factors import factor_registry

class ImpactCalculator:
    def calculate(self, request: ImpactCalculateRequest) -> ImpactResponse:
        ledger_input = Member3LedgerInput(**request.member3_ledger_input)
        mode = request.accounting_mode
        
        eco_ledger: List[EconomicLedgerEntry] = []
        env_ledger: List[EnvironmentalLedgerEntry] = []
        methodologies: List[ImpactMethodology] = []
        factor_sources = set()
        missing_factors = set()
        assumptions = []
        warnings = []
        
        # 1. Baseline Disposal
        baseline = ledger_input.baseline_disposal
        baseline_qty = baseline.get("total_baseline_tonnes", 0.0)
        baseline_gate_fee = baseline.get("default_gate_fee_usd_per_ton", 75.0)
        baseline_ef_val = baseline.get("baseline_emission_factor_kg_co2e_per_ton", 480.0)
        
        baseline_disposal_cost = baseline_qty * baseline_gate_fee
        baseline_emissions = (baseline_qty * baseline_ef_val) / 1000.0  # converted to tonnes CO2e
        
        env_ledger.append(EnvironmentalLedgerEntry(
            category=EnvironmentalCategory.BASELINE_DISPOSAL,
            activity_quantity=baseline_qty,
            activity_unit="tonnes",
            emission_factor=baseline_ef_val,
            factor_unit="kg_co2e_per_ton",
            emissions=baseline_emissions,
            emissions_unit="tCO2e",
            factor_source="Project Baseline EF",
            accounting_mode=mode,
            scenario="BASELINE",
            description="Baseline disposal emissions if all material was landfilled."
        ))
        
        methodologies.append(ImpactMethodology(
            formula="baseline_emissions = quantity * disposal_emission_factor / 1000",
            accounting_mode=mode,
            description="Baseline disposal emissions calculation."
        ))
        
        # 2. Optimized Scenario
        opt_reuse_qty = 0.0
        opt_disposal_qty = 0.0
        opt_transport_cost = 0.0
        opt_processing_cost = 0.0
        opt_disposal_cost = 0.0
        opt_revenue = 0.0
        
        opt_transport_emissions = 0.0
        opt_processing_emissions = 0.0
        opt_residual_emissions = 0.0
        opt_avoided_emissions = 0.0
        
        # Process Reuse Allocations
        for alloc in ledger_input.reuse_allocations:
            alloc_id = alloc.get("allocation_id", "")
            mat_id = alloc.get("material_id", "")
            input_t = alloc.get("input_tonnes", 0.0)
            delivered_t = alloc.get("delivered_tonnes", 0.0)
            dist_km = alloc.get("transport_distance_km", 0.0)
            t_mode = alloc.get("transport_mode", "TRUCK_DIESEL")
            t_ef = alloc.get("transport_emission_factor_kg_co2e_per_tkm", None)
            
            opt_reuse_qty += delivered_t
            
            # Transport Emissions
            if t_ef is None:
                ef_obj = factor_registry.get_factor_by_name_or_type(t_mode)
                if ef_obj:
                    t_ef = ef_obj.value
                    factor_sources.add(ef_obj.source)
                else:
                    t_ef = 0.0
                    missing_factors.add(f"Transport EF for {t_mode}")
            else:
                factor_sources.add("Provided in Optimizer Result")
                
            t_emis = (delivered_t * dist_km * t_ef) / 1000.0
            opt_transport_emissions += t_emis
            
            if t_emis > 0:
                env_ledger.append(EnvironmentalLedgerEntry(
                    material_id=mat_id,
                    allocation_id=alloc_id,
                    category=EnvironmentalCategory.TRANSPORT,
                    activity_quantity=delivered_t * dist_km,
                    activity_unit="t-km",
                    emission_factor=t_ef,
                    factor_unit="kg_co2e_per_tkm",
                    emissions=t_emis,
                    emissions_unit="tCO2e",
                    factor_source="Optimizer/Registry",
                    accounting_mode=mode,
                    scenario="OPTIMIZED",
                    description=f"Transport emissions for {delivered_t} t over {dist_km} km."
                ))
            
            # Processing Emissions
            proc_req = alloc.get("processing_required", False)
            if proc_req:
                proc_ef = factor_registry.get_factor("EF_PROC_DEFAULT")
                if proc_ef:
                    p_emis = (input_t * proc_ef.value) / 1000.0
                    opt_processing_emissions += p_emis
                    factor_sources.add(proc_ef.source)
                    env_ledger.append(EnvironmentalLedgerEntry(
                        material_id=mat_id,
                        allocation_id=alloc_id,
                        category=EnvironmentalCategory.PROCESSING,
                        activity_quantity=input_t,
                        activity_unit="tonnes",
                        emission_factor=proc_ef.value,
                        factor_unit="kg_co2e_per_ton",
                        emissions=p_emis,
                        emissions_unit="tCO2e",
                        factor_source=proc_ef.source,
                        accounting_mode=mode,
                        scenario="OPTIMIZED",
                        description=f"Processing emissions for {input_t} t."
                    ))
                else:
                    missing_factors.add("Processing EF")
                    
            # Substitution Credit
            if mode in [AccountingMode.SUBSTITUTION_CREDIT, AccountingMode.FULL_LEDGER]:
                disp_ratio = alloc.get("virgin_displacement_ratio", 1.0)
                avoided_ef = factor_registry.get_factor("EF_AVOIDED_CLINKER")
                if avoided_ef:
                    avoided_emis = (delivered_t * disp_ratio * avoided_ef.value) / 1000.0
                    opt_avoided_emissions += avoided_emis
                    factor_sources.add(avoided_ef.source)
                    env_ledger.append(EnvironmentalLedgerEntry(
                        material_id=mat_id,
                        allocation_id=alloc_id,
                        category=EnvironmentalCategory.AVOIDED_PRODUCTION,
                        activity_quantity=delivered_t * disp_ratio,
                        activity_unit="tonnes",
                        emission_factor=avoided_ef.value,
                        factor_unit="kg_co2e_per_ton",
                        emissions=avoided_emis,  # Positive value here, subtracted in net
                        emissions_unit="tCO2e",
                        factor_source=avoided_ef.source,
                        accounting_mode=mode,
                        scenario="OPTIMIZED",
                        description=f"Avoided virgin production credit for {delivered_t * disp_ratio} t."
                    ))
                else:
                    missing_factors.add("Avoided Production EF")

        methodologies.append(ImpactMethodology(
            formula="transport_emissions = quantity * distance * transport_ef / 1000",
            accounting_mode=mode,
            description="Transport emissions based on t-km."
        ))

        # Process Residuals
        for res in ledger_input.processing_residuals:
            qty = res.get("residual_tonnes", 0.0)
            opt_disposal_qty += qty
            r_emis = (qty * baseline_ef_val) / 1000.0
            opt_residual_emissions += r_emis
            env_ledger.append(EnvironmentalLedgerEntry(
                material_id=res.get("material_id"),
                allocation_id=res.get("allocation_id"),
                category=EnvironmentalCategory.RESIDUAL_DISPOSAL,
                activity_quantity=qty,
                activity_unit="tonnes",
                emission_factor=baseline_ef_val,
                factor_unit="kg_co2e_per_ton",
                emissions=r_emis,
                emissions_unit="tCO2e",
                factor_source="Project Baseline EF",
                accounting_mode=mode,
                scenario="OPTIMIZED",
                description="Disposal emissions for processing residuals."
            ))

        # Process Direct Disposal
        for disp in ledger_input.disposal_allocations:
            qty = disp.get("quantity_tonnes", 0.0)
            opt_disposal_qty += qty
            r_emis = (qty * baseline_ef_val) / 1000.0
            opt_residual_emissions += r_emis
            env_ledger.append(EnvironmentalLedgerEntry(
                material_id=disp.get("material_id"),
                category=EnvironmentalCategory.RESIDUAL_DISPOSAL,
                activity_quantity=qty,
                activity_unit="tonnes",
                emission_factor=baseline_ef_val,
                factor_unit="kg_co2e_per_ton",
                emissions=r_emis,
                emissions_unit="tCO2e",
                factor_source="Project Baseline EF",
                accounting_mode=mode,
                scenario="OPTIMIZED",
                description="Disposal emissions for direct baseline disposal."
            ))

        # Economic Ledger mapping
        ec = ledger_input.economic_ledger
        opt_transport_cost = ec.get("transport_cost", 0.0)
        opt_processing_cost = ec.get("processing_cost", 0.0)
        opt_disposal_cost = ec.get("disposal_cost", 0.0)
        opt_revenue = ec.get("revenue", 0.0)
        opt_total_cost = ec.get("net_cost", 0.0)
        
        eco_ledger.append(EconomicLedgerEntry(
            category=EconomicCategory.TRANSPORT,
            quantity=0, unit="system", unit_cost=0,
            total_cost=opt_transport_cost, source="Optimizer", scenario="OPTIMIZED"
        ))
        eco_ledger.append(EconomicLedgerEntry(
            category=EconomicCategory.PROCESSING,
            quantity=0, unit="system", unit_cost=0,
            total_cost=opt_processing_cost, source="Optimizer", scenario="OPTIMIZED"
        ))
        eco_ledger.append(EconomicLedgerEntry(
            category=EconomicCategory.DISPOSAL,
            quantity=0, unit="system", unit_cost=0,
            total_cost=opt_disposal_cost, source="Optimizer", scenario="OPTIMIZED"
        ))
        eco_ledger.append(EconomicLedgerEntry(
            category=EconomicCategory.REVENUE,
            quantity=0, unit="system", unit_cost=0,
            total_cost=opt_revenue, source="Optimizer", scenario="OPTIMIZED"
        ))

        # Calculations
        opt_total_emissions = opt_transport_emissions + opt_processing_emissions + opt_residual_emissions
        
        # Net change formula
        # net = opt - baseline - avoided
        net_emissions_change = opt_total_emissions - baseline_emissions
        if mode in [AccountingMode.SUBSTITUTION_CREDIT, AccountingMode.FULL_LEDGER]:
            net_emissions_change -= opt_avoided_emissions
            
        methodologies.append(ImpactMethodology(
            formula="net_change = (transport + processing + residual) - baseline_disposal" + 
                    (" - avoided_production" if opt_avoided_emissions > 0 else ""),
            accounting_mode=mode,
            description="Net change in emissions compared to baseline."
        ))

        cost_difference = opt_total_cost - baseline_disposal_cost
        
        diverted = baseline_qty - opt_disposal_qty
        div_pct = (diverted / baseline_qty * 100.0) if baseline_qty > 0 else 0.0
        emis_pct = ((net_emissions_change / baseline_emissions) * 100.0) if baseline_emissions != 0 else None

        if len(missing_factors) > 0:
            warnings.append("Some environmental factors are missing, partial calculation provided.")

        return ImpactResponse(
            baseline=BaselineImpact(
                quantity=baseline_qty,
                disposal_cost=baseline_disposal_cost,
                disposal_emissions=baseline_emissions
            ),
            optimized=OptimizedImpact(
                reuse_quantity=opt_reuse_qty,
                disposal_quantity=opt_disposal_qty,
                transport_cost=opt_transport_cost,
                processing_cost=opt_processing_cost,
                disposal_cost=opt_disposal_cost,
                reuse_value=opt_revenue,
                total_cost=opt_total_cost,
                transport_emissions=opt_transport_emissions,
                processing_emissions=opt_processing_emissions,
                residual_disposal_emissions=opt_residual_emissions,
                avoided_production_emissions=opt_avoided_emissions if opt_avoided_emissions > 0 else None,
                total_optimized_emissions=opt_total_emissions
            ),
            comparison=ImpactComparison(
                diverted_waste=diverted,
                diversion_percentage=div_pct,
                cost_difference=cost_difference,
                emissions_difference=net_emissions_change,
                emissions_change_percentage=emis_pct
            ),
            economic_ledger=eco_ledger,
            environmental_ledger=env_ledger,
            methodology=methodologies,
            factor_sources=list(factor_sources),
            missing_factors=list(missing_factors),
            assumptions=assumptions,
            warnings=warnings,
            accounting_mode=mode
        )
