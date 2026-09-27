import pytest
from backend.app.models.evidence import EvidenceType, is_evidence_sufficient, EVIDENCE_RIGOR_RANKS


def test_evidence_rigor_ranks():
    assert EVIDENCE_RIGOR_RANKS["LAB_VERIFIED"] == 5
    assert EVIDENCE_RIGOR_RANKS["OBSERVED"] == 4
    assert EVIDENCE_RIGOR_RANKS["SOURCE_BASED"] == 3
    assert EVIDENCE_RIGOR_RANKS["MODELED"] == 2
    assert EVIDENCE_RIGOR_RANKS["ASSUMED"] == 1
    assert EVIDENCE_RIGOR_RANKS["SYNTHETIC"] == 1
    assert EVIDENCE_RIGOR_RANKS["MISSING"] == 0


def test_is_evidence_sufficient():
    # LAB_VERIFIED satisfies any requirement
    assert is_evidence_sufficient("LAB_VERIFIED", "LAB_VERIFIED") is True
    assert is_evidence_sufficient("LAB_VERIFIED", "OBSERVED") is True
    assert is_evidence_sufficient("LAB_VERIFIED", "SOURCE_BASED") is True

    # OBSERVED satisfies OBSERVED and lower, but NOT LAB_VERIFIED
    assert is_evidence_sufficient("OBSERVED", "OBSERVED") is True
    assert is_evidence_sufficient("OBSERVED", "SOURCE_BASED") is True
    assert is_evidence_sufficient("OBSERVED", "LAB_VERIFIED") is False

    # SOURCE_BASED does not satisfy LAB_VERIFIED
    assert is_evidence_sufficient("SOURCE_BASED", "LAB_VERIFIED") is False
    assert is_evidence_sufficient("SOURCE_BASED", "SOURCE_BASED") is True

    # MISSING is never sufficient
    assert is_evidence_sufficient("MISSING", "ASSUMED") is False
    assert is_evidence_sufficient("MISSING", "LAB_VERIFIED") is False
