from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    address_type = Column(String(20), nullable=False)  # residential, postal, work
    street_address = Column(String(300), nullable=False)
    suburb = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False)
    province = Column(String(50), nullable=False)
    postal_code = Column(String(10), nullable=False)
    is_current = Column(Boolean, default=True)
    verified_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="addresses")
