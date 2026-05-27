from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(Integer, primary_key=True, index=True)
    id_number = Column(String(13), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)
    is_sa_citizen = Column(Boolean, default=True)
    is_alive = Column(Boolean, default=True)
    is_sassa_recipient = Column(Boolean, default=False)

    employments = relationship("Employment", back_populates="citizen")
    qualifications = relationship("Qualification", back_populates="citizen")
    burial_memberships = relationship("BurialSocietyMembership", back_populates="citizen")
    criminal_records = relationship("CriminalRecord", back_populates="citizen")
    credit_records = relationship("CreditRecord", back_populates="citizen")
    drivers_licences = relationship("DriversLicence", back_populates="citizen")
    professional_registrations = relationship("ProfessionalRegistration", back_populates="citizen")
    addresses = relationship("Address", back_populates="citizen")
    references = relationship("Reference", back_populates="citizen")
    disputes = relationship("Dispute", back_populates="citizen")
    blocked_companies = relationship("BlockedCompany", back_populates="citizen")
    user = relationship("User", back_populates="citizen", uselist=False)
