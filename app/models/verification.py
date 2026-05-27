from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    employer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_id_number = Column(String(13), nullable=False, index=True)
    reason = Column(String(300), nullable=True)  # why employer is verifying
    status = Column(String(20), default="pending")  # pending, partial, completed, expired
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("VerificationItem", back_populates="request")
    employer = relationship("User", foreign_keys=[employer_user_id])


class VerificationItem(Base):
    __tablename__ = "verification_items"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("verification_requests.id"), nullable=False)
    query_type = Column(String(50), nullable=False)
    query_params = Column(Text, nullable=False)  # JSON string
    consent_status = Column(String(20), default="pending")  # pending, approved, declined
    result = Column(String(10), nullable=True)  # Yes, No, or null if pending
    responded_at = Column(DateTime, nullable=True)

    request = relationship("VerificationRequest", back_populates="items")
