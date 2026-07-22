"""Update ORM model."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Update(Base):
    __tablename__ = "updates"

    update_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"), nullable=False, index=True)
    update_details = Column(Text, nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False)
    update_date = Column(Date, nullable=False, default=date.today)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="updates", lazy="selectin")
    status = relationship("Status", lazy="selectin")
