from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Employment(Base):
    __tablename__ = "employments"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    job_title = Column(String(200), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    salary_bracket = Column(String(20), nullable=False)

    citizen = relationship("Citizen", back_populates="employments")
    company = relationship("Company", back_populates="employments")
