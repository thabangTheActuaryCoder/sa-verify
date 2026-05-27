from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class ProfessionalRegistration(Base):
    __tablename__ = "professional_registrations"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    body_name = Column(String(200), nullable=False)
    # e.g. HPCSA, ECSA, SACAP, Law Society of SA, SAICA, SAIPA
    registration_number = Column(String(100), nullable=False)
    designation = Column(String(200), nullable=False)
    # e.g. Professional Engineer, Chartered Accountant, Attorney
    registration_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    is_in_good_standing = Column(Boolean, default=True)

    citizen = relationship("Citizen", back_populates="professional_registrations")
