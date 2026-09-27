from typing import Dict, Optional
from pydantic import BaseModel

class EmissionFactor(BaseModel):
    factor_id: str
    factor_name: str
    value: float
    unit: str
    source: str
    category: str
    version_year: Optional[str] = None
    geographic_scope: Optional[str] = None

class FactorRegistry:
    def __init__(self):
        self.factors: Dict[str, EmissionFactor] = {}
        self._seed_default_factors()

    def _seed_default_factors(self):
        self.register(EmissionFactor(
            factor_id="EF_TRUCK_DIESEL",
            factor_name="Diesel Truck Freight Transport",
            value=0.092,
            unit="kg_co2e_per_tkm",
            source="EPA GHG Emission Factors Hub 2023",
            category="TRANSPORT",
            version_year="2023",
            geographic_scope="US"
        ))
        self.register(EmissionFactor(
            factor_id="EF_RAIL_FREIGHT",
            factor_name="Rail Freight Transport",
            value=0.022,
            unit="kg_co2e_per_tkm",
            source="EPA GHG Emission Factors Hub 2023",
            category="TRANSPORT",
            version_year="2023",
            geographic_scope="US"
        ))
        self.register(EmissionFactor(
            factor_id="EF_DISPOSAL_LANDFILL",
            factor_name="Baseline Landfill Disposal",
            value=480.0,
            unit="kg_co2e_per_ton",
            source="DEFRA 2023",
            category="BASELINE_DISPOSAL",
            version_year="2023",
            geographic_scope="Global"
        ))
        self.register(EmissionFactor(
            factor_id="EF_PROC_DEFAULT",
            factor_name="Default Processing Emissions",
            value=15.0,
            unit="kg_co2e_per_ton",
            source="Generic Beneficiation 2023",
            category="PROCESSING",
            version_year="2023",
            geographic_scope="Global"
        ))
        self.register(EmissionFactor(
            factor_id="EF_AVOIDED_CLINKER",
            factor_name="Avoided Clinker Production",
            value=850.0,
            unit="kg_co2e_per_ton",
            source="WBCSD GNR 2022",
            category="AVOIDED_PRODUCTION",
            version_year="2022",
            geographic_scope="Global"
        ))

    def register(self, factor: EmissionFactor):
        self.factors[factor.factor_id] = factor

    def get_factor(self, factor_id: str) -> Optional[EmissionFactor]:
        return self.factors.get(factor_id)

    def get_factor_by_name_or_type(self, transport_mode: str) -> Optional[EmissionFactor]:
        if transport_mode == "TRUCK_DIESEL":
            return self.get_factor("EF_TRUCK_DIESEL")
        elif transport_mode == "RAIL_FREIGHT":
            return self.get_factor("EF_RAIL_FREIGHT")
        return None

factor_registry = FactorRegistry()
