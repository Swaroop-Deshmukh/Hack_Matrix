from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.pathway import Pathway
from ..models.requirement import PathwayRequirement
from ..schemas.pathway import PathwayResponse
from ..schemas.requirement import RequirementResponse

router = APIRouter(prefix="/pathways", tags=["Reuse Pathways & Requirements"])


@router.get("", response_model=List[PathwayResponse])
def list_pathways(active_only: bool = True, db: Session = Depends(get_db)):
    """Retrieves all registered industrial circular reuse pathways."""
    query = db.query(Pathway)
    if active_only:
        query = query.filter(Pathway.is_active == True)
    return query.all()


@router.get("/{id}", response_model=PathwayResponse)
def get_pathway(id: str, db: Session = Depends(get_db)):
    """Retrieves details of a specific reuse pathway."""
    pathway = db.query(Pathway).filter(Pathway.id == id).first()
    if not pathway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pathway '{id}' not found."
        )
    return pathway


@router.get("/{id}/requirements", response_model=List[RequirementResponse])
def get_pathway_requirements(id: str, db: Session = Depends(get_db)):
    """Retrieves all technical and evidence requirements configured for a pathway."""
    pathway = db.query(Pathway).filter(Pathway.id == id).first()
    if not pathway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pathway '{id}' not found."
        )
    return pathway.requirements
