from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)  # candidate, employer, admin
    is_active = Column(Boolean, default=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)

    citizen = relationship("Citizen", back_populates="user")
