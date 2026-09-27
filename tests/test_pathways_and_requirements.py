import pytest
from backend.app.models.pathway import Pathway
from backend.app.engine.operators import evaluate_operator


def test_operator_evaluations():
    # LTE
    passed, diff = evaluate_operator(4.5, "LTE", 5.0)
    assert passed is True
    assert diff == 0.0

    passed, diff = evaluate_operator(6.2, "LTE", 5.0)
    assert passed is False
    assert diff == 1.2

    # GTE
    passed, diff = evaluate_operator(55.0, "GTE", 35.0)
    assert passed is True
    assert diff == 0.0

    passed, diff = evaluate_operator(30.0, "GTE", 35.0)
    assert passed is False
    assert diff == 5.0

    # BETWEEN
    passed, diff = evaluate_operator(2.5, "BETWEEN", 2.0, 4.0)
    assert passed is True
    assert diff == 0.0

    passed, diff = evaluate_operator(1.5, "BETWEEN", 2.0, 4.0)
    assert passed is False
    assert diff == 0.5


def test_seeded_pathways_retrieval(db_session):
    pathways = db_session.query(Pathway).all()
    pw_ids = [p.id for p in pathways]
    assert "CEMENTITIOUS" in pw_ids
    assert "BLOCKS_BRICKS" in pw_ids
    assert "ROAD_INFRASTRUCTURE" in pw_ids
    assert "MINE_FILL" in pw_ids
