from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.database import Base


class CriminalRecord(Base):
    __tablename__ = "criminal_records"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    case_number = Column(String(50), nullable=False)
    offence = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False)  # minor, moderate, serious
    court = Column(String(200), nullable=True)
    date_convicted = Column(Date, nullable=True)
    sentence = Column(String(200), nullable=True)
    is_cleared = Column(Boolean, default=False)
    # Interpol / international wanted status
    is_interpol_wanted = Column(Boolean, default=False)
    interpol_notice_type = Column(String(20), nullable=True)  # red, blue, yellow, etc.
    wanted_countries = Column(Text, nullable=True)  # JSON list of country names
    interpol_case_ref = Column(String(100), nullable=True)

    citizen = relationship("Citizen", back_populates="criminal_records")
