
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


from app.models.user import User  # noqa: E402, F401
from app.models.domain import ServiceDeliveryDomain  # noqa: E402, F401
from app.models.tech_lead import TechLead  # noqa: E402, F401
from app.models.status import Status  # noqa: E402, F401
from app.models.project import Project  # noqa: E402, F401
from app.models.project_commercial import ProjectCommercial  # noqa: E402, F401
from app.models.project_update import ProjectUpdate  # noqa: E402, F401

