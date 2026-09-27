from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class OperatorType(str, Enum):
    LT = "LT"
    LTE = "LTE"
    EQ = "EQ"
    GTE = "GTE"
    GT = "GT"
    BETWEEN = "BETWEEN"


class RequirementType(str, Enum):
    HARD = "HARD"
    SOFT = "SOFT"


class RequirementBase(BaseModel):
    property_name: str = Field(..., min_length=1, max_length=64)
    operator: OperatorType
    threshold_value: float
    upper_threshold: Optional[float] = None
    unit: str = Field(..., min_length=1, max_length=32)
    requirement_type: RequirementType = RequirementType.HARD
    required_evidence: str = "LAB_VERIFIED"
    standard_id: Optional[str] = None
    standard_version: Optional[str] = None
    clause_reference: Optional[str] = None
    processing_remedy: Optional[str] = None
    remedy_description: Optional[str] = None


class RequirementCreate(RequirementBase):
    pathway_id: str = Field(..., min_length=1, max_length=64)


class RequirementResponse(RequirementBase):
    id: int
    pathway_id: str

    model_config = ConfigDict(from_attributes=True)
