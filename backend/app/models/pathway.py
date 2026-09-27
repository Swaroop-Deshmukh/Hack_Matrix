from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base


class Pathway(Base):
    """
    Configurable Reuse Pathway Entity.
    Defines target industrial circular-economy destination routes.
    """
    __tablename__ = "pathways"

    id = Column(String(64), primary_key=True, index=True)  # e.g. CEMENTITIOUS, BLOCKS_BRICKS, ROAD_INFRASTRUCTURE, MINE_FILL
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sector = Column(String(128), nullable=False, default="CONSTRUCTION")
    min_readiness_score = Column(Float, nullable=False, default=0.75)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    requirements = relationship("PathwayRequirement", back_populates="pathway", cascade="all, delete-orphan")
