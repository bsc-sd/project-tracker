"""Project ORM model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ComplexityEnum(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CloudProviderEnum(str, enum.Enum):
    AWS = "AWS"
    GCP = "GCP"
    AZURE = "Azure"
    HUAWEI = "Huawei Cloud"
    ALIBABA = "Alibaba Cloud"


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_name = Column(String(200), nullable=False, index=True)
    project_type = Column(String(100), nullable=False)
    project_details = Column(Text, nullable=True)
    tech_lead_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tech_leads.tech_lead_id"),
        nullable=False,
        index=True,
    )
    complexity = Column(String(20), nullable=False)
    status_id = Column(
        UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False, index=True
    )
    cloud_provider = Column(String(50), nullable=True)
    start_date = Column(Date, nullable=False)
    target_completion_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    tech_lead = relationship("TechLead", back_populates="projects", lazy="selectin")
    status = relationship("Status", back_populates="projects", lazy="selectin")
    commercials = relationship("Commercial", back_populates="project", lazy="selectin")
    milestones = relationship("Milestone", back_populates="project", lazy="selectin")
    updates = relationship("Update", back_populates="project", lazy="selectin")
