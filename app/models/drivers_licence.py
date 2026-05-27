from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class DriversLicence(Base):
    __tablename__ = "drivers_licences"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    licence_number = Column(String(50), unique=True, nullable=False)
    licence_code = Column(String(10), nullable=False)  # A, A1, B, C, C1, EB, EC, EC1
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    is_valid = Column(Boolean, default=True)
    restrictions = Column(String(200), nullable=True)  # e.g. "glasses required"
    endorsements = Column(Integer, default=0)

    citizen = relationship("Citizen", back_populates="drivers_licences")
