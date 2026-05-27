import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User
from app.models.citizen import Citizen
from app.models.company import Company
from app.models.notification import Notification
from app.models.blocked_company import BlockedCompany
from app.models.dispute import Dispute
from app.models.document import Document
from app.schemas.verification import (
    ConsentBatch,
    VerificationRequestResponse,
    VerificationItemResponse,
    DisputeCreate,
    DisputeResponse,
    BlockCompanyRequest,
    BlockedCompanyResponse,
    NotificationResponse,
    CandidateProfile,
    EmploymentRecord,
    QualificationRecord,
    CriminalRecordResponse,
    CreditRecordResponse,
    DriversLicenceResponse,
    ProfessionalRegResponse,
    AddressResponse,
    ReferenceResponse,
)
from app.services.verification_service import (
    get_requests_for_candidate,
    get_request_by_id,
    process_consent,
    get_verification_history,
)
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/candidate", tags=["candidate"])

UPLOAD_DIR = os.environ.get(
    "UPLOAD_DIR",
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads"),
)


def _get_citizen(current_user: User) -> Citizen:
    if not current_user.citizen:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No citizen record linked to this account",
        )
    return current_user.citizen


# ---- Profile ----

@router.get("/profile", response_model=CandidateProfile)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    return CandidateProfile(
        id_number=citizen.id_number,
        first_name=citizen.first_name,
        last_name=citizen.last_name,
        date_of_birth=citizen.date_of_birth.isoformat(),
        gender=citizen.gender,
        employments=[
            EmploymentRecord(
                company_name=e.company.name,
                job_title=e.job_title,
                start_date=e.start_date.isoformat(),
                end_date=e.end_date.isoformat() if e.end_date else None,
                is_current=e.is_current,
                salary_bracket=e.salary_bracket,
            )
            for e in citizen.employments
        ],
        qualifications=[
            QualificationRecord(
                qualification_type=q.qualification_type,
                field_of_study=q.field_of_study,
                institution=q.institution,
                year_obtained=q.year_obtained,
                is_institution_registered=q.is_institution_registered,
            )
            for q in citizen.qualifications
        ],
        criminal_records=[
            CriminalRecordResponse(
                case_number=r.case_number,
                offence=r.offence,
                severity=r.severity,
                date_convicted=r.date_convicted.isoformat() if r.date_convicted else None,
                is_cleared=r.is_cleared,
                is_interpol_wanted=r.is_interpol_wanted,
                interpol_notice_type=r.interpol_notice_type,
                wanted_countries=r.wanted_countries,
            )
            for r in citizen.criminal_records
        ],
        credit_records=[
            CreditRecordResponse(
                credit_score=c.credit_score,
                credit_score_band=c.credit_score_band,
                has_defaults=c.has_defaults,
                has_judgements=c.has_judgements,
                has_insolvency=c.has_insolvency,
                total_accounts=c.total_accounts,
                accounts_in_good_standing=c.accounts_in_good_standing,
                last_updated=c.last_updated,
            )
            for c in citizen.credit_records
        ],
        drivers_licences=[
            DriversLicenceResponse(
                licence_number=l.licence_number,
                licence_code=l.licence_code,
                issue_date=l.issue_date.isoformat(),
                expiry_date=l.expiry_date.isoformat(),
                is_valid=l.is_valid,
                restrictions=l.restrictions,
                endorsements=l.endorsements,
            )
            for l in citizen.drivers_licences
        ],
        professional_registrations=[
            ProfessionalRegResponse(
                body_name=p.body_name,
                registration_number=p.registration_number,
                designation=p.designation,
                registration_date=p.registration_date.isoformat(),
                expiry_date=p.expiry_date.isoformat() if p.expiry_date else None,
                is_active=p.is_active,
                is_in_good_standing=p.is_in_good_standing,
            )
            for p in citizen.professional_registrations
        ],
        addresses=[
            AddressResponse(
                address_type=a.address_type,
                street_address=a.street_address,
                suburb=a.suburb,
                city=a.city,
                province=a.province,
                postal_code=a.postal_code,
                is_current=a.is_current,
            )
            for a in citizen.addresses
        ],
        references=[
            ReferenceResponse(
                company_name=r.company.name,
                referee_name=r.referee_name,
                referee_position=r.referee_position,
                relationship_to_candidate=r.relationship_to_candidate,
                rating=r.rating,
                is_verified=r.is_verified,
            )
            for r in citizen.references
        ],
    )


# ---- Verification requests ----

@router.get("/requests", response_model=list[VerificationRequestResponse])
def list_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    requests = get_requests_for_candidate(db, citizen.id_number)
    return [_build_response(r) for r in requests]


@router.get("/requests/{request_id}", response_model=VerificationRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    request = get_request_by_id(db, request_id)
    if not request or request.candidate_id_number != citizen.id_number:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return _build_response(request)


@router.post("/consent")
def submit_consent(
    payload: ConsentBatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    results = []

    for decision in payload.decisions:
        if decision.decision not in ("approved", "declined"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid decision: {decision.decision}. Must be 'approved' or 'declined'.",
            )

        item = process_consent(db, decision.item_id, decision.decision, citizen.id_number)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item {decision.item_id} not found or not authorised",
            )
        results.append({
            "item_id": item.id,
            "consent_status": item.consent_status,
            "result": item.result,
        })

    log_action(
        db,
        action="submit_consent",
        resource_type="verification_item",
        user_id=current_user.id,
        username=current_user.username,
        details={"decisions": [d.model_dump() for d in payload.decisions]},
    )

    return {"message": "Consent processed successfully", "results": results}


# ---- Verification history ----

@router.get("/history")
def verification_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    return get_verification_history(db, citizen.id_number)


# ---- Disputes ----

@router.get("/disputes", response_model=list[DisputeResponse])
def list_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    disputes = (
        db.query(Dispute)
        .filter(Dispute.citizen_id == citizen.id)
        .order_by(Dispute.created_at.desc())
        .all()
    )
    return disputes


@router.post("/disputes", response_model=DisputeResponse)
def create_dispute(
    payload: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    dispute = Dispute(
        citizen_id=citizen.id,
        verification_item_id=payload.verification_item_id,
        dispute_type=payload.dispute_type,
        field_disputed=payload.field_disputed,
        reason=payload.reason,
        evidence_document_id=payload.evidence_document_id,
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)

    log_action(
        db,
        action="create_dispute",
        resource_type="dispute",
        resource_id=dispute.id,
        user_id=current_user.id,
        username=current_user.username,
        details={"dispute_type": payload.dispute_type, "field": payload.field_disputed},
    )

    return dispute


# ---- Block list ----

@router.get("/blocked-companies", response_model=list[BlockedCompanyResponse])
def list_blocked(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    blocks = (
        db.query(BlockedCompany)
        .filter(BlockedCompany.citizen_id == citizen.id)
        .all()
    )
    return [
        BlockedCompanyResponse(
            id=b.id,
            company_id=b.company_id,
            company_name=b.company.name,
            blocked_at=b.blocked_at,
        )
        for b in blocks
    ]


@router.post("/blocked-companies")
def block_company(
    payload: BlockCompanyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    existing = (
        db.query(BlockedCompany)
        .filter(BlockedCompany.citizen_id == citizen.id, BlockedCompany.company_id == payload.company_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Company already blocked")

    block = BlockedCompany(citizen_id=citizen.id, company_id=payload.company_id)
    db.add(block)
    db.commit()

    log_action(
        db,
        action="block_company",
        resource_type="blocked_company",
        user_id=current_user.id,
        username=current_user.username,
        details={"company_id": payload.company_id, "company_name": company.name},
    )

    return {"message": f"Blocked {company.name}"}


@router.delete("/blocked-companies/{block_id}")
def unblock_company(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    block = (
        db.query(BlockedCompany)
        .filter(BlockedCompany.id == block_id, BlockedCompany.citizen_id == citizen.id)
        .first()
    )
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Block not found")

    db.delete(block)
    db.commit()
    return {"message": "Company unblocked"}


# ---- Notifications ----

@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    n = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not n:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Marked as read"}


@router.get("/notifications/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .count()
    )
    return {"unread_count": count}


# ---- Document upload ----

@router.post("/documents")
async def upload_document(
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    stored_name = f"{uuid.uuid4().hex}{ext}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)

    content = await file.read()
    with open(stored_path, "wb") as f:
        f.write(content)

    doc = Document(
        citizen_id=citizen.id,
        document_type=document_type,
        filename=file.filename or stored_name,
        stored_path=stored_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "id": doc.id,
        "filename": doc.filename,
        "document_type": doc.document_type,
        "uploaded_at": doc.uploaded_at.isoformat(),
    }


@router.get("/documents")
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    citizen = _get_citizen(current_user)
    docs = db.query(Document).filter(Document.citizen_id == citizen.id).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "document_type": d.document_type,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
        }
        for d in docs
    ]


# ---- Companies lookup ----

@router.get("/companies")
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate")),
):
    """List all companies (for the block list dropdown)."""
    companies = db.query(Company).order_by(Company.name).all()
    return [{"id": c.id, "name": c.name} for c in companies]


# ---- Helpers ----

def _build_response(request):
    items = [
        VerificationItemResponse(
            id=item.id,
            query_type=item.query_type,
            query_params=item.query_params,
            consent_status=item.consent_status,
            result=item.result,
            responded_at=item.responded_at,
        )
        for item in request.items
    ]

    employer_name = request.employer.full_name if request.employer else None

    return VerificationRequestResponse(
        id=request.id,
        employer_user_id=request.employer_user_id,
        candidate_id_number=request.candidate_id_number,
        reason=request.reason,
        status=request.status,
        created_at=request.created_at,
        updated_at=request.updated_at,
        items=items,
        employer_name=employer_name,
    )
