from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    verification_item_id = Column(
        Integer, ForeignKey("verification_items.id"), nullable=True
    )
    dispute_type = Column(String(50), nullable=False)
    # employment, qualification, criminal_record, credit, address, licence, professional
    field_disputed = Column(String(200), nullable=False)
    reason = Column(Text, nullable=False)
    evidence_document_id = Column(
        Integer, ForeignKey("documents.id"), nullable=True
    )
    status = Column(String(20), default="open")  # open, under_review, resolved, rejected
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="disputes")
    verification_item = relationship("VerificationItem")
    evidence_document = relationship("Document")
