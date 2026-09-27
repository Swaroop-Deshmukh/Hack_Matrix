import pytest
from backend.app.schemas.feasibility import FeasibilityStatus
from backend.app.engine.evaluator import FeasibilityEngine
from backend.app.engine.operators import evaluate_operator
from backend.app.models.material import Material
from backend.app.models.property import MaterialProperty


def test_feasibility_direct_state(db_session):
    """FA-001 meets all mandatory requirements with certified LAB_VERIFIED evidence -> DIRECT."""
    result = FeasibilityEngine.evaluate_material_against_pathway("FA-001", "CEMENTITIOUS", db_session)
    assert result.status == FeasibilityStatus.DIRECT
    assert len(result.required_processing) == 0
    assert "Material fully satisfies" in result.explanation.summary
    assert len(result.explanation.recommended_actions) >= 1


def test_feasibility_process_state(db_session):
    """FA-002 fails direct moisture (8.5% > 3%) and fineness (41% > 34%), but both have configured remedies -> PROCESS."""
    result = FeasibilityEngine.evaluate_material_against_pathway("FA-002", "CEMENTITIOUS", db_session)
    assert result.status == FeasibilityStatus.PROCESS
    assert "DRYING" in result.required_processing
    assert "GRINDING" in result.required_processing
    assert len(result.explanation.near_misses) >= 2
    assert "DRYING" in [nm.potential_unlock_action for nm in result.explanation.near_misses]


def test_feasibility_unknown_state_missing_property(db_session):
    """SL-001 has missing mandatory properties (chloride and SO3) -> UNKNOWN (NEVER classified as FAIL)."""
    result = FeasibilityEngine.evaluate_material_against_pathway("SL-001", "CEMENTITIOUS", db_session)
    assert result.status == FeasibilityStatus.UNKNOWN
    # Missing data MUST NOT be classified as FAIL!
    assert result.status != FeasibilityStatus.FAIL
    missing_reasons = [r for r in result.explanation.reasons if r.status == "MISSING"]
    assert len(missing_reasons) >= 1


def test_feasibility_unknown_state_insufficient_evidence(db_session):
    """Material has property, but evidence tier is below standard requirement -> UNKNOWN."""
    mat = Material(
        id="MAT-LOW-EVID",
        material_type="FLY_ASH",
        material_name="Assumed Fly Ash",
        quantity_tonnes=100.0,
        location_name="Site X",
        latitude=18.0,
        longitude=73.0,
        source_name="Unknown",
    )
    db_session.add(mat)
    db_session.commit()

    # Add SiO2 with ASSUMED evidence (standard requires LAB_VERIFIED)
    prop = MaterialProperty(
        material_id="MAT-LOW-EVID",
        property_name="SiO2",
        value=55.0,  # Value passes threshold
        unit="%",
        evidence_type="ASSUMED",  # Insufficient!
        confidence=0.5,
    )
    db_session.add(prop)
    db_session.commit()

    result = FeasibilityEngine.evaluate_material_against_pathway("MAT-LOW-EVID", "CEMENTITIOUS", db_session)
    assert result.status == FeasibilityStatus.UNKNOWN
    evidence_reasons = [r for r in result.explanation.reasons if r.status in ("INSUFFICIENT_EVIDENCE", "MISSING")]
    assert len(evidence_reasons) >= 1


def test_feasibility_fail_state(db_session):
    """MW-001 has severe sulfate violation (15.2% > 5%) and arsenic (210 ppm > 50 ppm) without processing remedies -> FAIL."""
    result_cement = FeasibilityEngine.evaluate_material_against_pathway("MW-001", "CEMENTITIOUS", db_session)
    assert result_cement.status == FeasibilityStatus.FAIL

    result_mine = FeasibilityEngine.evaluate_material_against_pathway("MW-001", "MINE_FILL", db_session)
    assert result_mine.status == FeasibilityStatus.FAIL
    assert len(result_mine.explanation.near_misses) >= 1


def test_feasibility_invalid_material_or_pathway(db_session):
    with pytest.raises(ValueError, match="Material with ID 'NONEXISTENT' not found"):
        FeasibilityEngine.evaluate_material_against_pathway("NONEXISTENT", "CEMENTITIOUS", db_session)

    with pytest.raises(ValueError, match="Pathway with ID 'NONEXISTENT_PW' not found"):
        FeasibilityEngine.evaluate_material_against_pathway("FA-001", "NONEXISTENT_PW", db_session)


def test_operators_comprehensive():
    # LT
    assert evaluate_operator(5.0, "LT", 10.0)[0] is True
    assert evaluate_operator(12.0, "LT", 10.0)[0] is False
    assert evaluate_operator(12.0, "LT", 10.0)[1] == 2.0

    # GT
    assert evaluate_operator(15.0, "GT", 10.0)[0] is True
    assert evaluate_operator(8.0, "GT", 10.0)[0] is False
    assert evaluate_operator(8.0, "GT", 10.0)[1] == 2.0

    # EQ
    assert evaluate_operator(7.0, "EQ", 7.0)[0] is True
    assert evaluate_operator(7.5, "EQ", 7.0)[0] is False

    # BETWEEN
    assert evaluate_operator(5.0, "BETWEEN", 3.0, 7.0)[0] is True
    assert evaluate_operator(2.0, "BETWEEN", 3.0, 7.0)[0] is False
    assert evaluate_operator(2.0, "BETWEEN", 3.0, 7.0)[1] == 1.0
    assert evaluate_operator(8.5, "BETWEEN", 3.0, 7.0)[0] is False
    assert evaluate_operator(8.5, "BETWEEN", 3.0, 7.0)[1] == 1.5

    # Unsupported
    with pytest.raises(ValueError, match="Unsupported operator"):
        evaluate_operator(5.0, "INVALID_OP", 10.0)
