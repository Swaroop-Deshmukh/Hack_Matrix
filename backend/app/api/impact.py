from fastapi import APIRouter
from backend.app.schemas.impact import ImpactCalculateRequest, ImpactResponse
from backend.app.engine.impact import ImpactCalculator

router = APIRouter()
calculator = ImpactCalculator()

@router.post("/impact/calculate", response_model=ImpactResponse, tags=["Impact"])
def calculate_impact(request: ImpactCalculateRequest):
    return calculator.calculate(request)
