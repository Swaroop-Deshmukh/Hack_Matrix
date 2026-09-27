from datetime import date
from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base


class MaterialProperty(Base):
    """
    Flexible Material Property entity.
    Stores chemical and physical metrics without hard-coding columns into materials table.
    """
    __tablename__ = "material_properties"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    material_id = Column(String(64), ForeignKey("materials.id", ondelete="CASCADE"), nullable=False, index=True)
    property_name = Column(String(64), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    test_date = Column(Date, nullable=True)
    evidence_type = Column(String(32), nullable=False, default="LAB_VERIFIED", index=True)
    source = Column(String(255), nullable=True)
    source_reference = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=False, default=1.0)
    notes = Column(Text, nullable=True)

    # Relationship
    material = relationship("Material", back_populates="properties")
