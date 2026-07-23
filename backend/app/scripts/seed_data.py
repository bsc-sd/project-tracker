"""Seed initial data for development and testing."""

import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.domain import Domain
from app.models.status import Status
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    """Seed the database with initial data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Create admin user
        admin = User(
            email="admin@projecttracker.com",
            hashed_password=pwd_context.hash("Admin@2024!Secure"),
            full_name="System Administrator",
            role="admin",
        )
        session.add(admin)

        # Create default statuses
        statuses = ["Pipeline", "In Progress", "On Hold", "Completed", "Cancelled"]
        for name in statuses:
            session.add(Status(status_name=name))

        # Create sample domains
        domains = [
            "Cloud Infrastructure",
            "Networking",
            "Security",
            "Data Center",
            "Managed Services",
        ]
        for name in domains:
            session.add(Domain(domain_name=name))

        await session.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
