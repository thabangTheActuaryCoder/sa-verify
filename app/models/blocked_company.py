from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class BlockedCompany(Base):
    __tablename__ = "blocked_companies"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    blocked_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="blocked_companies")
    company = relationship("Company")
