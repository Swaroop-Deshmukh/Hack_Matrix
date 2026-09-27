from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.material import Material
from ..models.property import MaterialProperty
from ..schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
)
from ..schemas.property import (
    PropertyCreate,
    PropertyResponse,
    PropertyBulkCreate,
)

router = APIRouter(prefix="/materials", tags=["Materials & Waste Streams"])


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
def create_material(material_in: MaterialCreate, db: Session = Depends(get_db)):
    """Creates a new Material / Waste Stream entity."""
    existing = db.query(Material).filter(Material.id == material_in.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Material with ID '{material_in.id}' already exists."
        )

    material = Material(**material_in.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("", response_model=List[MaterialResponse])
def list_materials(
    material_type: Optional[str] = Query(None, description="Filter by material type e.g. FLY_ASH, SLAG"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Lists waste streams with optional type filter and pagination."""
    query = db.query(Material)
    if material_type:
        query = query.filter(Material.material_type == material_type.upper())
    return query.offset(skip).limit(limit).all()


@router.get("/{id}", response_model=MaterialResponse)
def get_material(id: str, db: Session = Depends(get_db)):
    """Retrieves a specific Material by its unique identifier."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{id}' not found."
        )
    return material


@router.patch("/{id}", response_model=MaterialResponse)
def update_material(id: str, updates: MaterialUpdate, db: Session = Depends(get_db)):
    """Partially updates a Material entity."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{id}' not found."
        )

    update_data = updates.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(material, field, val)

    db.commit()
    db.refresh(material)
    return material


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(id: str, db: Session = Depends(get_db)):
    """Deletes a Material entity and all associated properties."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{id}' not found."
        )
    db.delete(material)
    db.commit()
    return None


# -------------------------------------------------------------
# Material Property Sub-Resource Endpoints
# -------------------------------------------------------------

@router.post("/{id}/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def add_material_property(id: str, prop_in: PropertyCreate, db: Session = Depends(get_db)):
    """Adds a chemical or physical property to a waste stream."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{id}' not found."
        )

    # Check if this property already exists on the material; if so update it
    existing = (
        db.query(MaterialProperty)
        .filter(
            MaterialProperty.material_id == id,
            MaterialProperty.property_name == prop_in.property_name
        )
        .first()
    )
    if existing:
        for k, v in prop_in.model_dump().items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    prop = MaterialProperty(material_id=id, **prop_in.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.get("/{id}/properties", response_model=List[PropertyResponse])
def get_material_properties(id: str, db: Session = Depends(get_db)):
    """Lists all chemical, physical, and contaminant properties recorded for a material."""
    material = db.query(Material).filter(Material.id == id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{id}' not found."
        )
    return material.properties
