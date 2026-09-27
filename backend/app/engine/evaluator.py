from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..models.material import Material
from ..models.property import MaterialProperty
from ..models.pathway import Pathway
from ..models.requirement import PathwayRequirement
from ..models.evidence import is_evidence_sufficient
from ..schemas.feasibility import (
    FeasibilityStatus,
    RequirementCheckResult,
    FeasibilityEvaluationResult,
)
from .operators import evaluate_operator
from .explainer import FeasibilityExplainer


class FeasibilityEngine:
    """
    Deterministic Feasibility Engine.
    Evaluates a waste stream against configurable technical pathway requirements.
    Adheres strictly to the four-state classification:
    - DIRECT: All mandatory requirements pass with sufficient evidence.
    - PROCESS: Direct requirements fail, but configured processing pre-treatment can address the gap.
    - UNKNOWN: Required property or evidence is missing/insufficient (NEVER classified as FAIL).
    - FAIL: Mandatory requirement violated with no configured processing route.
    """

    @classmethod
    def evaluate_material_against_pathway(
        cls,
        material_id: str,
        pathway_id: str,
        db: Session,
    ) -> FeasibilityEvaluationResult:
        material = db.query(Material).filter(Material.id == material_id).first()
        if not material:
            raise ValueError(f"Material with ID '{material_id}' not found.")

        pathway = db.query(Pathway).filter(Pathway.id == pathway_id).first()
        if not pathway:
            raise ValueError(f"Pathway with ID '{pathway_id}' not found.")

        # Map material properties by normalized name (uppercase)
        props_map: Dict[str, MaterialProperty] = {
            p.property_name.upper(): p for p in material.properties
        }

        requirements = (
            db.query(PathwayRequirement)
            .filter(PathwayRequirement.pathway_id == pathway_id)
            .all()
        )

        checks: List[RequirementCheckResult] = []
        required_processing_set = set()

        has_fail = False
        has_unknown = False
        has_processable = False

        for req in requirements:
            prop_key = req.property_name.upper()
            observed_prop = props_map.get(prop_key)

            if observed_prop is None:
                # Property is missing!
                check_status = "UNKNOWN"
                has_unknown = True
                checks.append(RequirementCheckResult(
                    property=req.property_name,
                    observed_value=None,
                    required_value=req.threshold_value,
                    upper_threshold=req.upper_threshold,
                    operator=req.operator,
                    unit=req.unit,
                    status=check_status,
                    evidence_type=None,
                    required_evidence=req.required_evidence,
                    evidence_sufficient=False,
                    requirement_type=req.requirement_type,
                    processing_remedy=req.processing_remedy,
                    remedy_description=req.remedy_description,
                    near_miss_difference=None,
                ))
                continue

            # Check evidence sufficiency
            evidence_ok = is_evidence_sufficient(
                observed_prop.evidence_type,
                req.required_evidence
            )

            if not evidence_ok:
                # Evidence is insufficient!
                check_status = "UNKNOWN"
                has_unknown = True
                checks.append(RequirementCheckResult(
                    property=req.property_name,
                    observed_value=observed_prop.value,
                    required_value=req.threshold_value,
                    upper_threshold=req.upper_threshold,
                    operator=req.operator,
                    unit=req.unit,
                    status=check_status,
                    evidence_type=observed_prop.evidence_type,
                    required_evidence=req.required_evidence,
                    evidence_sufficient=False,
                    requirement_type=req.requirement_type,
                    processing_remedy=req.processing_remedy,
                    remedy_description=req.remedy_description,
                    near_miss_difference=None,
                ))
                continue

            # Evaluate operator threshold
            is_pass, diff = evaluate_operator(
                observed_prop.value,
                req.operator,
                req.threshold_value,
                req.upper_threshold,
            )

            if is_pass:
                check_status = "PASS"
            else:
                # Threshold violated. Can it be remedied by processing?
                if req.processing_remedy:
                    check_status = "PROCESSABLE"
                    has_processable = True
                    required_processing_set.add(req.processing_remedy)
                else:
                    check_status = "FAIL"
                    if req.requirement_type == "HARD":
                        has_fail = True

            checks.append(RequirementCheckResult(
                property=req.property_name,
                observed_value=observed_prop.value,
                required_value=req.threshold_value,
                upper_threshold=req.upper_threshold,
                operator=req.operator,
                unit=req.unit,
                status=check_status,
                evidence_type=observed_prop.evidence_type,
                required_evidence=req.required_evidence,
                evidence_sufficient=True,
                requirement_type=req.requirement_type,
                processing_remedy=req.processing_remedy,
                remedy_description=req.remedy_description,
                near_miss_difference=diff,
            ))

        # Overall pathway status aggregation
        if has_fail:
            overall_status = FeasibilityStatus.FAIL
        elif has_unknown:
            # Do not classify missing data as FAIL!
            overall_status = FeasibilityStatus.UNKNOWN
        elif has_processable:
            overall_status = FeasibilityStatus.PROCESS
        else:
            overall_status = FeasibilityStatus.DIRECT

        explanation = FeasibilityExplainer.generate_explanation(
            status=overall_status,
            checks=checks,
            pathway_name=pathway.name,
        )

        return FeasibilityEvaluationResult(
            material_id=material_id,
            pathway_id=pathway_id,
            pathway_name=pathway.name,
            status=overall_status,
            checks=checks,
            required_processing=sorted(list(required_processing_set)),
            explanation=explanation,
        )
