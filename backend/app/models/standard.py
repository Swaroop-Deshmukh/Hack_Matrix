from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from ..core.database import Base


class StandardMetadata(Base):
    """
    Metadata for official engineering benchmarks and synthetic specifications.
    Explicitly flags synthetic demo requirements to prevent false claims of official certification.
    """
    __tablename__ = "standards"

    id = Column(String(64), primary_key=True, index=True)  # e.g. ASTM_C618, EN_450_1, IRC_SP20, SYNTHETIC_DEMO_REQUIREMENT
    name = Column(String(255), nullable=False)
    organization = Column(String(128), nullable=False)      # e.g. ASTM, CEN, IRC, or DEMO
    version = Column(String(64), nullable=False)           # e.g. "2023", "2012", "DEMO-1.0"
    description = Column(Text, nullable=True)
    is_synthetic_demo = Column(Boolean, nullable=False, default=False)
    source_reference = Column(String(255), nullable=True)
    disclaimer = Column(
        Text,
        nullable=False,
        default="Technical screening standard. Not an official regulatory certification."
    )

    # Relationships
    requirements = relationship("PathwayRequirement", back_populates="standard")
