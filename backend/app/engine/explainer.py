from typing import List
from ..schemas.feasibility import (
    FeasibilityStatus,
    RequirementCheckResult,
    FeasibilityExplanation,
    ExplanationReason,
    NearMissItem,
)


class FeasibilityExplainer:
    """Generates structured explainability reports and near-miss calculations."""

    @classmethod
    def generate_explanation(
        cls,
        status: FeasibilityStatus,
        checks: List[RequirementCheckResult],
        pathway_name: str
    ) -> FeasibilityExplanation:
        reasons: List[ExplanationReason] = []
        recommended_actions: List[str] = []
        near_misses: List[NearMissItem] = []

        if status == FeasibilityStatus.DIRECT:
            summary = f"Material fully satisfies all mandatory technical requirements for {pathway_name}."
            recommended_actions.append(f"Proceed to commercial offtake and logistics allocation for {pathway_name}.")

        elif status == FeasibilityStatus.PROCESS:
            summary = f"Direct compliance not currently met for {pathway_name}, but configured processing pre-treatment can unlock this pathway."
            for c in checks:
                if c.status == "PROCESSABLE":
                    remedy = c.processing_remedy or "Pre-treatment"
                    desc = c.remedy_description or f"Apply {remedy}"
                    reasons.append(ExplanationReason(
                        property=c.property,
                        status="PROCESSABLE",
                        message=f"{c.property} observed ({c.observed_value} {c.unit}) exceeds direct threshold ({c.required_value} {c.unit}), but can be resolved via {remedy}."
                    ))
                    recommended_actions.append(f"Execute {remedy}: {desc}.")
                    if c.near_miss_difference is not None and c.near_miss_difference > 0:
                        near_misses.append(NearMissItem(
                            property=c.property,
                            observed=c.observed_value or 0.0,
                            threshold=c.required_value,
                            difference=c.near_miss_difference,
                            unit=c.unit,
                            potential_unlock_action=remedy
                        ))

        elif status == FeasibilityStatus.UNKNOWN:
            summary = f"Pathway {pathway_name} cannot currently be verified due to missing measurements or insufficient evidence pedigree."
            for c in checks:
                if c.status == "UNKNOWN":
                    if c.observed_value is None:
                        reasons.append(ExplanationReason(
                            property=c.property,
                            status="MISSING",
                            message=f"Required property '{c.property}' has no recorded test value."
                        ))
                        recommended_actions.append(f"Commission laboratory assay or field testing for '{c.property}' ({c.unit}).")
                    elif not c.evidence_sufficient:
                        reasons.append(ExplanationReason(
                            property=c.property,
                            status="INSUFFICIENT_EVIDENCE",
                            message=f"Property '{c.property}' has evidence tier '{c.evidence_type}', but standard requires '{c.required_evidence}'."
                        ))
                        recommended_actions.append(f"Upgrade '{c.property}' evidence to certified '{c.required_evidence}' testing.")

        elif status == FeasibilityStatus.FAIL:
            summary = f"Pathway {pathway_name} is technically infeasible: mandatory threshold violated without viable processing route."
            for c in checks:
                if c.status == "FAIL":
                    reasons.append(ExplanationReason(
                        property=c.property,
                        status="VIOLATED",
                        message=f"Mandatory requirement failed: observed {c.property} = {c.observed_value} {c.unit} violates requirement ({c.operator} {c.required_value} {c.unit})."
                    ))
                    if c.near_miss_difference is not None:
                        near_misses.append(NearMissItem(
                            property=c.property,
                            observed=c.observed_value or 0.0,
                            threshold=c.required_value,
                            difference=c.near_miss_difference,
                            unit=c.unit,
                            potential_unlock_action="Requires raw stream source modification or alternative chemical blending."
                        ))
            recommended_actions.append(f"Explore alternative circular pathways or consider baseline disposal/stabilization.")

        return FeasibilityExplanation(
            status=status,
            summary=summary,
            reasons=reasons,
            recommended_actions=recommended_actions,
            near_misses=near_misses,
        )
