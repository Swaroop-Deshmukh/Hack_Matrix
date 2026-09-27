from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ReusePathway(str, Enum):
    # 3+ Distinct reuse pathways + baseline disposal
    PATHWAY_1_SCM_CONCRETE = "scm_concrete_replacement"
    PATHWAY_2_ROAD_BASE = "engineered_road_base_aggregate"
    PATHWAY_3_GEOPOLYMER = "geopolymer_binder_synthesis"
    COMPETING_DISPOSAL = "baseline_landfill_or_incineration"


class EvaluationStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    MARGINAL = "MARGINAL"  # Requires pre-treatment (e.g. drying, de-chlorination)


class CriterionEvaluation(BaseModel):
    parameter: str
    observed_value: float
    comparator: str  # "<=", ">=", "range", "=="
    threshold_value: float
    secondary_threshold: Optional[float] = None
    unit: str
    status: EvaluationStatus
    engineering_rationale: str
    remediation_hint: Optional[str] = None


class PathwayFeasibility(BaseModel):
    pathway: ReusePathway
    is_feasible: bool
    status: EvaluationStatus
    confidence_score: float = Field(ge=0.0, le=1.0)
    criteria_evaluations: List[CriterionEvaluation]
    summary_explanation: str
    applicable_standards: List[str] = Field(
        default_factory=list,
        description="Reference benchmarks (e.g., ASTM C618 Class F, EN 450-1, IS 3812)"
    )
    required_pretreatment: List[str] = Field(default_factory=list)


class FeasibilityReport(BaseModel):
    stream_id: str
    pathway_evaluations: List[PathwayFeasibility]
    feasible_pathways: List[ReusePathway]
    infeasible_pathways: List[ReusePathway]
