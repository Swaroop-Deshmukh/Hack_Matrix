from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text
from ..core.database import Base


class DisposalSite(Base):
    """
    Baseline Disposal Site Entity (Member 2).
    Represents default disposal infrastructure (landfill, ash lagoon pond, or incinerator).
    Provides explicit economic and mass balance baseline against which circular reuse is evaluated.
    """
    __tablename__ = "disposal_sites"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    disposal_type = Column(String(64), nullable=False, default="LANDFILL")  # LANDFILL, INCINERATION, ASH_POND
    gate_fee_per_ton = Column(Float, nullable=False, default=75.0)  # Baseline disposal tipping cost
    capacity_tonnes = Column(Float, nullable=False, default=100000.0)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
