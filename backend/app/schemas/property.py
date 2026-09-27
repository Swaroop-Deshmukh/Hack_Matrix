from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PropertyBase(BaseModel):
    property_name: str = Field(..., min_length=1, max_length=64, description="Property code e.g. SiO2, Al2O3, SO3, LOI, moisture")
    value: float = Field(..., description="Numerical measured value")
    unit: str = Field(..., min_length=1, max_length=32, description="Unit of measurement e.g. %, g/cm3, um, ppm")
    test_date: Optional[date] = None
    evidence_type: str = Field(default="LAB_VERIFIED", description="Evidence classification: OBSERVED, LAB_VERIFIED, SOURCE_BASED, MODELED, ASSUMED, SYNTHETIC, MISSING")
    source: Optional[str] = Field(None, max_length=255)
    source_reference: Optional[str] = Field(None, max_length=255)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    notes: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    test_date: Optional[date] = None
    evidence_type: Optional[str] = None
    source: Optional[str] = None
    source_reference: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    notes: Optional[str] = None


class PropertyResponse(PropertyBase):
    id: int
    material_id: str

    model_config = ConfigDict(from_attributes=True)


class PropertyBulkCreate(BaseModel):
    properties: List[PropertyCreate]
