
from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ComplexityEnum(str, Enum):
    """Complexity levels for projects."""

    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


class ProjectCreate(BaseModel):
    """Schema for creating a project."""

    project_name: str = Field(..., min_length=1, max_length=255)
    project_type: Optional[str] = Field(None, max_length=100)
    project_details: Optional[str] = None
    project_commercial_name: Optional[str] = Field(None, max_length=255)
    tech_lead_id: int
    complexity: ComplexityEnum = ComplexityEnum.MEDIUM
    status_id: int
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""

    project_name: Optional[str] = Field(None, min_length=1, max_length=255)
    project_type: Optional[str] = Field(None, max_length=100)
    project_details: Optional[str] = None
    project_commercial_name: Optional[str] = Field(None, max_length=255)
    tech_lead_id: Optional[int] = None
    complexity: Optional[ComplexityEnum] = None
    status_id: Optional[int] = None
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None
    actual_completion_date: Optional[date] = None


class ProjectResponse(BaseModel):
    """Schema for project response."""

    id: int
    project_name: str
    project_type: Optional[str]
    project_details: Optional[str]
    project_commercial_name: Optional[str]
    tech_lead_id: int
    tech_lead_name: Optional[str] = None
    complexity: str
    status_id: int
    status_name: Optional[str] = None
    start_date: Optional[date]
    target_completion_date: Optional[date]
    actual_completion_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

