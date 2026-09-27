from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class PathwayRequirement(Base):
    """
    Configurable technical requirement rule for a reuse pathway.
    Stores numerical threshold, operator, requirement type (HARD/SOFT),
    evidence rigor, and optional processing remedy.
    """
    __tablename__ = "pathway_requirements"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    pathway_id = Column(String(64), ForeignKey("pathways.id", ondelete="CASCADE"), nullable=False, index=True)
    property_name = Column(String(64), nullable=False, index=True)
    operator = Column(String(16), nullable=False)  # LT, LTE, EQ, GTE, GT, BETWEEN
    threshold_value = Column(Float, nullable=False)
    upper_threshold = Column(Float, nullable=True)  # Used when operator == BETWEEN
    unit = Column(String(32), nullable=False)
    requirement_type = Column(String(16), nullable=False, default="HARD")  # HARD, SOFT
    required_evidence = Column(String(32), nullable=False, default="LAB_VERIFIED")  # LAB_VERIFIED, OBSERVED, etc.
    standard_id = Column(String(64), ForeignKey("standards.id"), nullable=True)
    standard_version = Column(String(64), nullable=True)
    clause_reference = Column(String(128), nullable=True)
    processing_remedy = Column(String(64), nullable=True)  # e.g. DRYING, GRINDING, MAGNETIC_SEPARATION, WASHING
    remedy_description = Column(String(255), nullable=True)

    # Relationships
    pathway = relationship("Pathway", back_populates="requirements")
    standard = relationship("StandardMetadata", back_populates="requirements")
