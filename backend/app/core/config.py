import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "RE:FLOW-X"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # Baseline Reference Emission Factors (LCA synthetic benchmarks - e.g. DEFRA / US EPA WARM)
    # Explicitly labeled as synthetic engineering benchmarks
    BASELINE_LANDFILL_EMISSION_KG_CO2E_PER_TON: float = 480.0
    BASELINE_INCINERATION_EMISSION_KG_CO2E_PER_TON: float = 950.0
    BASELINE_DISPOSAL_GATE_FEE_USD_PER_TON: float = 75.0
    
    # Transport emission defaults (kg CO2e / ton-km)
    TRUCK_DIESEL_EMISSION_FACTOR: float = 0.092
    RAIL_FREIGHT_EMISSION_FACTOR: float = 0.024
    TRUCK_ELECTRIC_EMISSION_FACTOR: float = 0.038
    
    # Grid emission factor (kg CO2e / kWh)
    GRID_ELECTRICITY_EMISSION_FACTOR: float = 0.42
    
    # Virgin material displacement benchmarks (kg CO2e / ton virgin displaced)
    VIRGIN_OPC_CLINKER_EMBODIED_CO2E_PER_TON: float = 820.0
    VIRGIN_CRUSHED_AGGREGATE_EMBODIED_CO2E_PER_TON: float = 12.5
    VIRGIN_CERAMIC_BINDER_EMBODIED_CO2E_PER_TON: float = 450.0
    
    # Default Solver Timeout (seconds)
    SOLVER_TIMEOUT_SECONDS: float = 15.0

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
