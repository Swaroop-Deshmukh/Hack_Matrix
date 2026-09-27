from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class Destination(Base):
    """
    Reuse Destination / Offtaker Entity (Member 2).
    Represents industrial buyers (e.g. cement plants, precast block manufacturers, road works).
    Defines pathway linkage, maximum capacity/demand, purchase price, and location.
    """
    __tablename__ = "destinations"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    pathway_id = Column(String(64), ForeignKey("pathways.id"), nullable=False, index=True)
    max_demand_tonnes = Column(Float, nullable=False, default=5000.0)
    min_demand_tonnes = Column(Float, nullable=False, default=0.0)
    purchase_price_per_ton = Column(Float, nullable=False, default=25.0)  # Revenue credited to circular model
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    pathway = relationship("Pathway")
