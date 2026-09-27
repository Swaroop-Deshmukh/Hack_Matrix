from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.facility import Facility
from ..models.destination import Destination
from ..models.disposal import DisposalSite
from ..models.allocation import OptimizationRun
from ..schemas.optimizer import (
    OptimizationRequest,
    OptimizationResponse,
    FacilityCreate,
    FacilityResponse,
    DestinationCreate,
    DestinationResponse,
    DisposalSiteCreate,
    DisposalSiteResponse,
    ScenarioComparisonResponse,
    ScenarioComparisonItem,
    ScenarioConfig,
    ScenarioMode,
)
from ..engine.optimizer import AllocationOptimizer

router = APIRouter(prefix="/optimize", tags=["Member 2: Processing & Allocation Optimizer"])
facilities_router = APIRouter(prefix="/facilities", tags=["Member 2: Facility Registry"])
destinations_router = APIRouter(prefix="/destinations", tags=["Member 2: Destination Registry"])
disposal_router = APIRouter(prefix="/disposal-sites", tags=["Member 2: Disposal Sites"])


# -------------------------------------------------------------
# Core Optimization Endpoints
# -------------------------------------------------------------

@router.post(
    "",
    response_model=OptimizationResponse,
    summary="Execute Multi-Destination Processing & Allocation Optimization",
    description="Allocates material streams across candidate reuse pathways, processing facilities, and baseline disposal using OR-Tools CP-SAT/Linear Programming.",
)
def run_optimization(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
):
    try:
        response = AllocationOptimizer.optimize(request=request, db=db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization solver execution failed: {str(e)}"
        )


@router.get(
    "/scenarios",
    summary="List Preconfigured Scenario Modes",
    description="Returns available optimization scenario modes (Cost Minimization, Max Diversion, Balanced, Custom).",
)
def get_scenario_presets():
    return [
        {
            "mode": ScenarioMode.COST_MINIMIZATION.value,
            "name": "Least Net Cost",
            "description": "Strict economic optimization minimizing transport, processing, and disposal minus revenue.",
            "cost_weight": 1.0,
            "diversion_weight": 0.0,
            "diversion_incentive_per_ton": 0.0,
        },
        {
            "mode": ScenarioMode.MAX_DIVERSION.value,
            "name": "Maximum Circular Diversion",
            "description": "Circular economy focus maximizing diversion from landfill with high diversion credit.",
            "cost_weight": 1.0,
            "diversion_weight": 50.0,
            "diversion_incentive_per_ton": 50.0,
        },
        {
            "mode": ScenarioMode.BALANCED.value,
            "name": "Balanced Economic / Environmental",
            "description": "Multi-objective Pareto trade-off between logistical costs and landfill diversion rate.",
            "cost_weight": 1.0,
            "diversion_weight": 20.0,
            "diversion_incentive_per_ton": 20.0,
        },
        {
            "mode": ScenarioMode.CUSTOM.value,
            "name": "Custom Scenario",
            "description": "User-defined constraint tolerances, transport distances, and weights.",
            "cost_weight": 1.0,
            "diversion_weight": 0.0,
            "diversion_incentive_per_ton": 0.0,
        },
    ]


@router.post(
    "/compare-scenarios",
    response_model=ScenarioComparisonResponse,
    summary="Compare Multi-Scenario Trade-offs",
    description="Runs optimization across Cost Minimization, Max Diversion, and Balanced scenarios to evaluate trade-offs.",
)
def compare_scenarios(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
):
    scenarios_to_run = [
        ScenarioConfig(
            mode=ScenarioMode.COST_MINIMIZATION,
            name="Cost Minimization",
            cost_weight=1.0,
            diversion_weight=0.0,
            diversion_incentive_per_ton=0.0,
        ),
        ScenarioConfig(
            mode=ScenarioMode.BALANCED,
            name="Balanced Strategy",
            cost_weight=1.0,
            diversion_weight=20.0,
            diversion_incentive_per_ton=20.0,
        ),
        ScenarioConfig(
            mode=ScenarioMode.MAX_DIVERSION,
            name="Maximum Diversion",
            cost_weight=1.0,
            diversion_weight=50.0,
            diversion_incentive_per_ton=50.0,
        ),
    ]

    items = []
    for sc in scenarios_to_run:
        req_copy = request.model_copy(deep=True)
        req_copy.scenario = sc
        res = AllocationOptimizer.optimize(request=req_copy, db=db)
        items.append(ScenarioComparisonItem(
            scenario_mode=sc.mode.value,
            scenario_name=sc.name,
            diverted_tonnes=res.summary.total_diverted_tonnes,
            disposed_tonnes=res.summary.total_disposed_tonnes,
            diversion_rate_pct=res.summary.diversion_rate_pct,
            net_cost=res.summary.net_cost,
            total_transport_cost=res.summary.total_transport_cost,
            total_processing_cost=res.summary.total_processing_cost,
            total_revenue=res.summary.total_revenue,
            bottlenecks_count=len(res.bottlenecks),
        ))

    return ScenarioComparisonResponse(
        material_id=request.material_id,
        scenarios=items,
    )


# -------------------------------------------------------------
# Facility Registry Endpoints
# -------------------------------------------------------------

@facilities_router.get("", response_model=List[FacilityResponse], summary="List Processing Facilities")
def list_facilities(db: Session = Depends(get_db)):
    return db.query(Facility).filter(Facility.is_active == True).all()


@facilities_router.post("", response_model=FacilityResponse, status_code=status.HTTP_201_CREATED, summary="Register Processing Facility")
def create_facility(payload: FacilityCreate, db: Session = Depends(get_db)):
    existing = db.query(Facility).filter(Facility.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Facility '{payload.id}' already exists.")
    fac = Facility(**payload.model_dump())
    db.add(fac)
    db.commit()
    db.refresh(fac)
    return fac


@facilities_router.get("/{facility_id}", response_model=FacilityResponse, summary="Get Facility Details")
def get_facility(facility_id: str, db: Session = Depends(get_db)):
    fac = db.query(Facility).filter(Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Facility '{facility_id}' not found.")
    return fac


# -------------------------------------------------------------
# Destination Registry Endpoints
# -------------------------------------------------------------

@destinations_router.get("", response_model=List[DestinationResponse], summary="List Reuse Destinations")
def list_destinations(db: Session = Depends(get_db)):
    return db.query(Destination).filter(Destination.is_active == True).all()


@destinations_router.post("", response_model=DestinationResponse, status_code=status.HTTP_201_CREATED, summary="Register Reuse Destination")
def create_destination(payload: DestinationCreate, db: Session = Depends(get_db)):
    existing = db.query(Destination).filter(Destination.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Destination '{payload.id}' already exists.")
    dest = Destination(**payload.model_dump())
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest


@destinations_router.get("/{destination_id}", response_model=DestinationResponse, summary="Get Destination Details")
def get_destination(destination_id: str, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Destination '{destination_id}' not found.")
    return dest


# -------------------------------------------------------------
# Disposal Sites Endpoints
# -------------------------------------------------------------

@disposal_router.get("", response_model=List[DisposalSiteResponse], summary="List Baseline Disposal Sites")
def list_disposal_sites(db: Session = Depends(get_db)):
    return db.query(DisposalSite).filter(DisposalSite.is_active == True).all()


@disposal_router.post("", response_model=DisposalSiteResponse, status_code=status.HTTP_201_CREATED, summary="Register Disposal Site")
def create_disposal_site(payload: DisposalSiteCreate, db: Session = Depends(get_db)):
    existing = db.query(DisposalSite).filter(DisposalSite.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Disposal site '{payload.id}' already exists.")
    site = DisposalSite(**payload.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site
