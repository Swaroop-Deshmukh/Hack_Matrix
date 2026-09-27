from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text
from ..core.database import Base


class Facility(Base):
    """
    Processing / Pre-treatment Facility Entity (Member 2).
    Represents industrial beneficiation facilities (e.g. rotary drying, grinding, washing).
    Exposes processing yield, unit costs, capacities, and emission factors for Member 3.
    """
    __tablename__ = "facilities"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    process_types = Column(String(255), nullable=False)  # Comma-separated list e.g. "DRYING,GRINDING"
    capacity_tonnes = Column(Float, nullable=False, default=1000.0)
    processing_cost_per_ton = Column(Float, nullable=False, default=15.0)
    processing_yield = Column(Float, nullable=False, default=0.95)  # eta in (0, 1]
    energy_kwh_per_ton = Column(Float, nullable=False, default=35.0)
    emissions_factor_kg_co2e_per_ton = Column(Float, nullable=False, default=15.0)  # Exposed for Member 3
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
