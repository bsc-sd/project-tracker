"""Milestone ORM model."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Milestone(Base):
    __tablename__ = "milestones"

    milestone_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"), nullable=False, index=True)
    milestone_details = Column(String(500), nullable=False)
    milestone_date = Column(Date, nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="milestones", lazy="selectin")
    status = relationship("Status", lazy="selectin")
