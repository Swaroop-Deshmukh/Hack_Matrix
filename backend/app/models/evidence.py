from enum import Enum
from typing import Dict


class EvidenceType(str, Enum):
    """
    Evidence hierarchy classification representing data pedigree and laboratory rigor.
    Higher tiers reflect greater verifiability and lower uncertainty.
    """
    LAB_VERIFIED = "LAB_VERIFIED"      # Certified accredited laboratory testing (e.g. ISO/IEC 17025)
    OBSERVED = "OBSERVED"              # Direct site sensor or operational measurement
    SOURCE_BASED = "SOURCE_BASED"      # Technical data sheet (TDS), mill test report (MTR) from manufacturer
    MODELED = "MODELED"                # Thermodynamic, mass-balance, or computational estimate
    ASSUMED = "ASSUMED"                # Engineering assumption or literature average
    SYNTHETIC = "SYNTHETIC"            # Synthetic demonstration benchmark
    MISSING = "MISSING"                # No measurement or record available


# Numerical rigor score (0 to 5) for comparative evaluation
EVIDENCE_RIGOR_RANKS: Dict[str, int] = {
    EvidenceType.LAB_VERIFIED.value: 5,
    EvidenceType.OBSERVED.value: 4,
    EvidenceType.SOURCE_BASED.value: 3,
    EvidenceType.MODELED.value: 2,
    EvidenceType.ASSUMED.value: 1,
    EvidenceType.SYNTHETIC.value: 1,
    EvidenceType.MISSING.value: 0,
}


def is_evidence_sufficient(observed_evidence: str, required_evidence: str) -> bool:
    """
    Evaluates whether the observed evidence meets or exceeds the required rigor level.
    """
    obs_rank = EVIDENCE_RIGOR_RANKS.get(observed_evidence.upper(), 0)
    req_rank = EVIDENCE_RIGOR_RANKS.get(required_evidence.upper(), 0)
    return obs_rank >= req_rank and obs_rank > 0
