from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class CreditRecord(Base):
    __tablename__ = "credit_records"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    credit_score = Column(Integer, nullable=False)  # 300-900 range
    credit_score_band = Column(String(20), nullable=False)
    # poor (300-579), fair (580-669), good (670-739), excellent (740-900)
    has_defaults = Column(Boolean, default=False)
    has_judgements = Column(Boolean, default=False)
    has_insolvency = Column(Boolean, default=False)
    total_accounts = Column(Integer, default=0)
    accounts_in_good_standing = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="credit_records")
