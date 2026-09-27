from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.pathway import Pathway
from ..schemas.feasibility import FeasibilityStatus
from .evaluator import FeasibilityEngine


def get_feasible_routes(
    material_id: str,
    db: Optional[Session] = None
) -> List[Dict[str, Any]]:
    """
    STABLE SHARED CONTRACT for Member 2 (Processing + Optimization).
    Evaluates the material against all active reuse pathways and returns candidate routes.

    Returns:
    [
      {
        "pathway_id": "CEMENTITIOUS",
        "status": "DIRECT",
        "required_processing": []
      },
      {
        "pathway_id": "BLOCKS_BRICKS",
        "status": "PROCESS",
        "required_processing": ["GRINDING"]
      }
    ]
    """
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        active_pathways = (
            db.query(Pathway)
            .filter(Pathway.is_active == True)
            .all()
        )

        routes: List[Dict[str, Any]] = []

        for pw in active_pathways:
            eval_res = FeasibilityEngine.evaluate_material_against_pathway(
                material_id=material_id,
                pathway_id=pw.id,
                db=db
            )

            # Member 2 is interested in evaluating pathways, particularly DIRECT, PROCESS, and UNKNOWN/FAIL
            routes.append({
                "pathway_id": pw.id,
                "status": eval_res.status.value,
                "required_processing": eval_res.required_processing,
            })

        return routes

    finally:
        if close_db:
            db.close()
