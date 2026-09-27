from enum import Enum
from typing import Dict, Optional
from pydantic import BaseModel, Field


class WasteType(str, Enum):
    COAL_FLY_ASH = "coal_fly_ash"
    BLAST_FURNACE_SLAG = "blast_furnace_slag"
    FOUNDRY_SAND = "foundry_sand"
    CONSTRUCTION_DEMOLITION_FINES = "c_and_d_fines"
    SPENT_SOLVENT = "spent_solvent"
    GENERAL_INDUSTRIAL_SLUDGE = "general_industrial_sludge"


class ChemicalComposition(BaseModel):
    """Normalized mass fraction percentages (0-100%)."""
    sio2_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Silicon Dioxide (%)")
    al2o3_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Aluminum Oxide (%)")
    fe2o3_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Iron Oxide (%)")
    cao_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Calcium Oxide (%)")
    mgo_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Magnesium Oxide (%)")
    so3_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Sulfate as SO3 (%)")
    chloride_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Chloride ion (%)")
    loss_on_ignition_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Loss on Ignition / Unburnt Carbon (%)")


class PhysicalProperties(BaseModel):
    moisture_content_pct: float = Field(default=5.0, ge=0.0, le=100.0, description="Moisture content (%)")
    ph: float = Field(default=7.0, ge=0.0, le=14.0, description="pH level")
    density_g_cm3: float = Field(default=1.5, ge=0.1, le=10.0, description="Bulk density (g/cm3)")
    mean_particle_size_um: float = Field(default=45.0, ge=0.1, description="D50 particle size in microns")
    calorific_value_mj_kg: float = Field(default=0.0, ge=0.0, description="Net calorific value (MJ/kg)")


class HeavyMetalContaminants(BaseModel):
    """Heavy metal concentrations in mg/kg (ppm) or leachability mg/L."""
    lead_pb_ppm: float = Field(default=0.0, ge=0.0, description="Lead (mg/kg)")
    cadmium_cd_ppm: float = Field(default=0.0, ge=0.0, description="Cadmium (mg/kg)")
    arsenic_as_ppm: float = Field(default=0.0, ge=0.0, description="Arsenic (mg/kg)")
    chromium_cr_ppm: float = Field(default=0.0, ge=0.0, description="Chromium (mg/kg)")
    mercury_hg_ppm: float = Field(default=0.0, ge=0.0, description="Mercury (mg/kg)")


class Location(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    facility_name: str = Field(default="Origin Facility")
    address: Optional[str] = None


class WasteStreamInput(BaseModel):
    stream_id: str = Field(..., description="Unique batch or stream identifier")
    waste_type: WasteType
    generation_rate_tons_per_month: float = Field(..., gt=0.0, description="Quantity generated per month (metric tons)")
    origin_location: Location
    chemical: ChemicalComposition = Field(default_factory=ChemicalComposition)
    physical: PhysicalProperties = Field(default_factory=PhysicalProperties)
    contaminants: HeavyMetalContaminants = Field(default_factory=HeavyMetalContaminants)
    is_hazardous: bool = Field(default=False, description="Regulatory hazardous designation")
    metadata: Dict[str, str] = Field(default_factory=dict)
