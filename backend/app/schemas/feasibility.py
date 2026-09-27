from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class FeasibilityStatus(str, Enum):
    DIRECT = "DIRECT"    # All mandatory requirements pass
    PROCESS = "PROCESS"  # Not currently satisfied, but configured processing can address the gap
    UNKNOWN = "UNKNOWN"  # Required property or evidence is missing/insufficient (not classified as FAIL)
    FAIL = "FAIL"        # Known mandatory requirement violated with no configured processing route


class RequirementCheckResult(BaseModel):
    property: str
    observed_value: Optional[float] = None
    required_value: float
    upper_threshold: Optional[float] = None
    operator: str
    unit: str
    status: str  # PASS, FAIL, UNKNOWN, PROCESSABLE
    evidence_type: Optional[str] = None
    required_evidence: str
    evidence_sufficient: bool = True
    requirement_type: str = "HARD"
    processing_remedy: Optional[str] = None
    remedy_description: Optional[str] = None
    near_miss_difference: Optional[float] = None


class ExplanationReason(BaseModel):
    property: str
    status: str  # MISSING, INSUFFICIENT_EVIDENCE, VIOLATED, PROCESSABLE
    message: str


class NearMissItem(BaseModel):
    property: str
    observed: float
    threshold: float
    difference: float
    unit: str
    potential_unlock_action: Optional[str] = None


class FeasibilityExplanation(BaseModel):
    status: FeasibilityStatus
    summary: str
    reasons: List[ExplanationReason]
    recommended_actions: List[str]
    near_misses: List[NearMissItem] = Field(default_factory=list)


class FeasibilityEvaluationResult(BaseModel):
    material_id: str
    pathway_id: str
    pathway_name: str
    status: FeasibilityStatus
    checks: List[RequirementCheckResult]
    required_processing: List[str] = Field(default_factory=list)
    explanation: FeasibilityExplanation


class FeasibleRouteContract(BaseModel):
    pathway_id: str
    status: FeasibilityStatus
    required_processing: List[str] = Field(default_factory=list)


class FeasibilityCheckRequest(BaseModel):
    material_id: str
    pathway_id: Optional[str] = None  # None to check all pathways


class BulkFeasibilityCheckRequest(BaseModel):
    material_ids: List[str]
    pathway_ids: Optional[List[str]] = None
