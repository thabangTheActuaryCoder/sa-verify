from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship

from app.database import Base


class BurialSocietyMembership(Base):
    __tablename__ = "burial_society_memberships"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    society_name = Column(String(200), nullable=False)
    membership_number = Column(String(50), unique=True, nullable=False)
    join_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    monthly_premium = Column(Float, nullable=False)

    citizen = relationship("Citizen", back_populates="burial_memberships")
