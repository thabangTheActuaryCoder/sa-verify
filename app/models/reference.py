from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    referee_name = Column(String(200), nullable=False)
    referee_position = Column(String(200), nullable=False)
    referee_contact = Column(String(100), nullable=False)  # phone or email
    relationship_to_candidate = Column(String(100), nullable=False)
    # e.g. "Direct Manager", "HR Manager", "Colleague"
    reference_text = Column(Text, nullable=True)
    rating = Column(String(20), nullable=True)
    # excellent, good, satisfactory, poor
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)

    citizen = relationship("Citizen", back_populates="references")
    company = relationship("Company")
