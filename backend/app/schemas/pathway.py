from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PathwayBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    sector: str = Field(default="CONSTRUCTION", max_length=128)
    min_readiness_score: float = Field(default=0.75, ge=0.0, le=1.0)
    is_active: bool = True


class PathwayCreate(PathwayBase):
    id: str = Field(..., min_length=1, max_length=64, description="Unique pathway code e.g. CEMENTITIOUS")


class PathwayUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    min_readiness_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_active: Optional[bool] = None


class PathwayResponse(PathwayBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
