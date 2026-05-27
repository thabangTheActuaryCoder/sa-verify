from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    is_registered = Column(Boolean, default=True)
    sector = Column(String(100))

    employments = relationship("Employment", back_populates="company")
