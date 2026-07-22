"""TechLead ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class TechLead(Base):
    __tablename__ = "tech_leads"

    tech_lead_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    domain_id = Column(UUID(as_uuid=True), ForeignKey("domains.domain_id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    domain = relationship("Domain", back_populates="tech_leads", lazy="selectin")
    projects = relationship("Project", back_populates="tech_lead", lazy="selectin")
