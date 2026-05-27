from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Qualification(Base):
    __tablename__ = "qualifications"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    qualification_type = Column(String(100), nullable=False)
    field_of_study = Column(String(200), nullable=False)
    institution = Column(String(200), nullable=False)
    year_obtained = Column(Integer, nullable=False)
    is_institution_registered = Column(Boolean, default=True)

    citizen = relationship("Citizen", back_populates="qualifications")
