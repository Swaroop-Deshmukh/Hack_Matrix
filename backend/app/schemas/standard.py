from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class StandardMetadataBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    organization: str = Field(..., min_length=1, max_length=128)
    version: str = Field(..., min_length=1, max_length=64)
    description: Optional[str] = None
    is_synthetic_demo: bool = False
    source_reference: Optional[str] = None
    disclaimer: str = "Technical screening standard. Not an official regulatory certification."


class StandardMetadataCreate(StandardMetadataBase):
    id: str = Field(..., min_length=1, max_length=64)


class StandardMetadataResponse(StandardMetadataBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
