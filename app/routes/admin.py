import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User
from app.models.citizen import Citizen
from app.models.company import Company
from app.models.dispute import Dispute
from app.models.verification import VerificationRequest
from app.schemas.verification import (
    FraudAlert,
    SystemStats,
    UserCreate,
    UserUpdate,
    CompanyCreate,
    CompanyUpdate,
    DisputeResolve,
)
from app.services.fraud_service import detect_all_fraud
from app.services.notification_service import process_all_fraud_notifications
from app.services.audit_service import get_audit_log, log_action
from app.services.auth_service import hash_password
from app.services.verification_service import get_all_requests

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---- Fraud ----

@router.get("/fraud-alerts", response_model=list[FraudAlert])
def fraud_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return detect_all_fraud(db)


@router.post("/fraud-alerts/notify")
def send_fraud_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    alerts = detect_all_fraud(db)
    results = process_all_fraud_notifications(db, alerts)
    return {
        "message": "Fraud notifications processed",
        "total_alerts": len(alerts),
        "notifications_dispatched": results,
    }


# ---- Stats ----

@router.get("/stats", response_model=SystemStats)
def system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    total_citizens = db.query(Citizen).count()
    total_companies = db.query(Company).count()
    total_requests = db.query(VerificationRequest).count()
    pending = db.query(VerificationRequest).filter(VerificationRequest.status == "pending").count()
    completed = db.query(VerificationRequest).filter(VerificationRequest.status == "completed").count()
    fraud_count = len(detect_all_fraud(db))

    return SystemStats(
        total_citizens=total_citizens,
        total_companies=total_companies,
        total_verification_requests=total_requests,
        pending_requests=pending,
        completed_requests=completed,
        total_fraud_alerts=fraud_count,
    )


# ---- Audit log ----

@router.get("/audit-log")
def audit_log(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    entries = get_audit_log(db, limit=limit, offset=offset)
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "user_id": e.user_id,
            "username": e.username,
            "action": e.action,
            "resource_type": e.resource_type,
            "resource_id": e.resource_id,
            "details": json.loads(e.details) if e.details else None,
            "ip_address": e.ip_address,
        }
        for e in entries
    ]


# ---- Verification requests ----

@router.get("/requests")
def all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    requests = get_all_requests(db)
    return [
        {
            "id": r.id,
            "employer_user_id": r.employer_user_id,
            "employer_name": r.employer.full_name if r.employer else None,
            "candidate_id_number": r.candidate_id_number,
            "reason": r.reason,
            "status": r.status,
            "item_count": len(r.items),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in requests
    ]


# ---- User management ----

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    users = db.query(User).order_by(User.id).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "citizen_id": u.citizen_id,
            "company_id": u.company_id,
        }
        for u in users
    ]


@router.post("/users")
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    if payload.role not in ("candidate", "employer", "admin"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        citizen_id=payload.citizen_id,
        company_id=payload.company_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_action(
        db,
        action="create_user",
        resource_type="user",
        resource_id=user.id,
        user_id=current_user.id,
        username=current_user.username,
        details={"new_username": payload.username, "role": payload.role},
    )

    return {"id": user.id, "username": user.username, "message": "User created"}


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        if payload.role not in ("candidate", "employer", "admin"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()

    log_action(
        db,
        action="update_user",
        resource_type="user",
        resource_id=user_id,
        user_id=current_user.id,
        username=current_user.username,
    )

    return {"message": "User updated"}


# ---- Company management ----

@router.get("/companies")
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    companies = db.query(Company).order_by(Company.id).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "registration_number": c.registration_number,
            "is_registered": c.is_registered,
            "sector": c.sector,
        }
        for c in companies
    ]


@router.post("/companies")
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    existing = db.query(Company).filter(Company.registration_number == payload.registration_number).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Registration number already exists")

    company = Company(
        name=payload.name,
        registration_number=payload.registration_number,
        is_registered=payload.is_registered,
        sector=payload.sector,
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    log_action(
        db,
        action="create_company",
        resource_type="company",
        resource_id=company.id,
        user_id=current_user.id,
        username=current_user.username,
        details={"company_name": payload.name},
    )

    return {"id": company.id, "name": company.name, "message": "Company created"}


@router.put("/companies/{company_id}")
def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    if payload.name is not None:
        company.name = payload.name
    if payload.is_registered is not None:
        company.is_registered = payload.is_registered
    if payload.sector is not None:
        company.sector = payload.sector

    db.commit()

    log_action(
        db,
        action="update_company",
        resource_type="company",
        resource_id=company_id,
        user_id=current_user.id,
        username=current_user.username,
    )

    return {"message": "Company updated"}


# ---- Disputes ----

@router.get("/disputes")
def list_all_disputes(
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    query = db.query(Dispute)
    if status_filter:
        query = query.filter(Dispute.status == status_filter)
    disputes = query.order_by(Dispute.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "citizen_name": f"{d.citizen.first_name} {d.citizen.last_name}" if d.citizen else "N/A",
            "citizen_id_number": d.citizen.id_number if d.citizen else "N/A",
            "dispute_type": d.dispute_type,
            "field_disputed": d.field_disputed,
            "reason": d.reason,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in disputes
    ]


@router.put("/disputes/{dispute_id}")
def resolve_dispute(
    dispute_id: int,
    payload: DisputeResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")

    if payload.status not in ("under_review", "resolved", "rejected"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")

    dispute.status = payload.status
    dispute.resolution_notes = payload.resolution_notes
    db.commit()

    log_action(
        db,
        action="resolve_dispute",
        resource_type="dispute",
        resource_id=dispute_id,
        user_id=current_user.id,
        username=current_user.username,
        details={"new_status": payload.status},
    )

    return {"message": "Dispute updated"}
