from typing import Dict, Optional
from pydantic import BaseModel, Field
from ..models.evidence import EvidenceType, EVIDENCE_RIGOR_RANKS, is_evidence_sufficient


class EvidenceEvaluation(BaseModel):
    observed_evidence: EvidenceType
    required_evidence: EvidenceType
    is_sufficient: bool
    observed_rank: int
    required_rank: int
    rationale: str


class EvidenceMetadata(BaseModel):
    evidence_type: EvidenceType
    rigor_rank: int
    description: str
    suitable_for_hard_standards: bool
