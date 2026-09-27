from datetime import datetime, date
from typing import Optional
from sqlalchemy import Column, String, Float, DateTime, Date, Text
from sqlalchemy.orm import relationship
from ..core.database import Base


class Material(Base):
    """
    Material / Waste Stream Entity representing an industrial byproduct stream.
    Supports FLY_ASH, SLAG, MINE_WASTE and extensible types.
    """
    __tablename__ = "materials"

    id = Column(String(64), primary_key=True, index=True)
    material_type = Column(String(64), nullable=False, index=True)
    material_name = Column(String(255), nullable=False)
    quantity_tonnes = Column(Float, nullable=False, default=0.0)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    availability_start = Column(Date, nullable=True)
    availability_end = Column(Date, nullable=True)
    source_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    properties = relationship("MaterialProperty", back_populates="material", cascade="all, delete-orphan")
