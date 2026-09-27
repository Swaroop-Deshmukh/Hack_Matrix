from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.material import Material
from ..models.pathway import Pathway
from ..schemas.feasibility import (
    FeasibilityCheckRequest,
    BulkFeasibilityCheckRequest,
    FeasibilityEvaluationResult,
)
from ..engine.evaluator import FeasibilityEngine

router = APIRouter(prefix="/feasibility", tags=["Feasibility Screening Engine"])


@router.post("/check", response_model=List[FeasibilityEvaluationResult])
def check_feasibility(request: FeasibilityCheckRequest, db: Session = Depends(get_db)):
    """
    Evaluates a material against a single pathway (if specified) or all active pathways.
    Returns deterministic status (DIRECT, PROCESS, UNKNOWN, FAIL), parameter-level checks,
    near-miss differences, and structured explainability.
    """
    material = db.query(Material).filter(Material.id == request.material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{request.material_id}' not found."
        )

    if request.pathway_id:
        pathway = db.query(Pathway).filter(Pathway.id == request.pathway_id).first()
        if not pathway:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pathway '{request.pathway_id}' not found."
            )
        eval_result = FeasibilityEngine.evaluate_material_against_pathway(
            material_id=request.material_id,
            pathway_id=request.pathway_id,
            db=db
        )
        return [eval_result]

    # Evaluate against all active pathways
    pathways = db.query(Pathway).filter(Pathway.is_active == True).all()
    results = [
        FeasibilityEngine.evaluate_material_against_pathway(
            material_id=request.material_id,
            pathway_id=p.id,
            db=db
        )
        for p in pathways
    ]
    return results


@router.get("/{material_id}", response_model=List[FeasibilityEvaluationResult])
def get_material_feasibility(material_id: str, db: Session = Depends(get_db)):
    """Convenience GET endpoint to evaluate a material against all active reuse pathways."""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{material_id}' not found."
        )

    pathways = db.query(Pathway).filter(Pathway.is_active == True).all()
    return [
        FeasibilityEngine.evaluate_material_against_pathway(
            material_id=material_id,
            pathway_id=p.id,
            db=db
        )
        for p in pathways
    ]


@router.post("/bulk-check", response_model=List[List[FeasibilityEvaluationResult]])
def bulk_check_feasibility(request: BulkFeasibilityCheckRequest, db: Session = Depends(get_db)):
    """Bulk evaluates multiple waste streams against designated pathways."""
    bulk_results = []
    target_pathways = (
        db.query(Pathway)
        .filter(Pathway.id.in_(request.pathway_ids))
        .all()
        if request.pathway_ids
        else db.query(Pathway).filter(Pathway.is_active == True).all()
    )

    for mat_id in request.material_ids:
        mat = db.query(Material).filter(Material.id == mat_id).first()
        if not mat:
            continue
        stream_results = [
            FeasibilityEngine.evaluate_material_against_pathway(
                material_id=mat_id,
                pathway_id=p.id,
                db=db
            )
            for p in target_pathways
        ]
        bulk_results.append(stream_results)

    return bulk_results
