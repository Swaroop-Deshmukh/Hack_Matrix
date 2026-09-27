from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class StandardMaterialType(str, Enum):
    FLY_ASH = "FLY_ASH"
    SLAG = "SLAG"
    MINE_WASTE = "MINE_WASTE"
    FOUNDRY_SAND = "FOUNDRY_SAND"
    RED_MUD = "RED_MUD"
    OTHER = "OTHER"


class MaterialBase(BaseModel):
    material_type: str = Field(..., description="Type of material e.g. FLY_ASH, SLAG, MINE_WASTE, or custom")
    material_name: str = Field(..., min_length=1, max_length=255)
    quantity_tonnes: float = Field(..., ge=0.0)
    location_name: str = Field(..., min_length=1, max_length=255)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    availability_start: Optional[date] = None
    availability_end: Optional[date] = None
    source_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class MaterialCreate(MaterialBase):
    id: str = Field(..., min_length=1, max_length=64, description="Unique material identifier e.g. FA-001")


class MaterialUpdate(BaseModel):
    material_type: Optional[str] = None
    material_name: Optional[str] = None
    quantity_tonnes: Optional[float] = Field(None, ge=0.0)
    location_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    availability_start: Optional[date] = None
    availability_end: Optional[date] = None
    source_name: Optional[str] = None
    description: Optional[str] = None


class MaterialResponse(MaterialBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
