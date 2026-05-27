from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("citizens.id"), nullable=False)
    document_type = Column(String(50), nullable=False)
    # payslip, degree_certificate, id_copy, drivers_licence_copy, reference_letter, other
    filename = Column(String(300), nullable=False)
    stored_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
