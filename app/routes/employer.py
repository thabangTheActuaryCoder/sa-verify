from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User
from app.models.citizen import Citizen
from app.models.notification import Notification
from app.schemas.verification import (
    VerificationRequestCreate,
    VerificationRequestResponse,
    VerificationItemResponse,
    BulkVerificationCreate,
    NotificationResponse,
)
from app.services.verification_service import (
    create_verification_request,
    get_requests_by_employer,
    get_request_by_id,
    is_company_blocked,
)
from app.services.report_service import generate_verification_report
from app.services.audit_service import log_action
from app.services.id_validator import validate_sa_id

router = APIRouter(prefix="/api/employer", tags=["employer"])


@router.post("/verify", response_model=VerificationRequestResponse)
def submit_verification(
    payload: VerificationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
):
    validation = validate_sa_id(payload.candidate_id_number)
    if not validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid SA ID number: {validation['error']}",
        )

    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one query item is required",
        )

    # Check if candidate has blocked this employer's company
    citizen = db.query(Citizen).filter(Citizen.id_number == payload.candidate_id_number).first()
    if citizen and current_user.company_id:
        if is_company_blocked(db, citizen.id, current_user.company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This candidate has blocked verification requests from your company.",
            )

    items = [{"query_type": i.query_type, "query_params": i.query_params} for i in payload.items]

    request = create_verification_request(
        db,
        employer_user_id=current_user.id,
        candidate_id_number=payload.candidate_id_number,
        items=items,
        reason=payload.reason,
    )

    log_action(
        db,
        action="create_verification_request",
        resource_type="verification_request",
        resource_id=request.id,
        user_id=current_user.id,
        username=current_user.username,
        details={
            "candidate_id": payload.candidate_id_number,
            "item_count": len(items),
            "reason": payload.reason,
        },
    )

    return _build_response(request, current_user)


@router.post("/verify-bulk")
def submit_bulk_verification(
    payload: BulkVerificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
):
    """Submit verification requests for multiple candidates at once."""
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one query item is required",
        )

    if not payload.candidate_id_numbers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one candidate ID number is required",
        )

    results = []
    errors = []

    for id_number in payload.candidate_id_numbers:
        validation = validate_sa_id(id_number)
        if not validation["is_valid"]:
            errors.append({"id_number": id_number, "error": validation["error"]})
            continue

        # Check block list
        citizen = db.query(Citizen).filter(Citizen.id_number == id_number).first()
        if citizen and current_user.company_id:
            if is_company_blocked(db, citizen.id, current_user.company_id):
                errors.append({"id_number": id_number, "error": "Candidate has blocked your company"})
                continue

        items = [{"query_type": i.query_type, "query_params": i.query_params} for i in payload.items]
        request = create_verification_request(
            db,
            employer_user_id=current_user.id,
            candidate_id_number=id_number,
            items=items,
            reason=payload.reason,
        )
        results.append({"id_number": id_number, "request_id": request.id})

    log_action(
        db,
        action="bulk_verification",
        resource_type="verification_request",
        user_id=current_user.id,
        username=current_user.username,
        details={
            "total_candidates": len(payload.candidate_id_numbers),
            "submitted": len(results),
            "errors": len(errors),
        },
    )

    return {
        "message": f"Submitted {len(results)} requests, {len(errors)} errors",
        "submitted": results,
        "errors": errors,
    }


@router.get("/requests", response_model=list[VerificationRequestResponse])
def list_requests(
    status_filter: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
):
    requests = get_requests_by_employer(db, current_user.id, status_filter, search)
    return [_build_response(r, current_user) for r in requests]


@router.get("/requests/{request_id}", response_model=VerificationRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
):
    request = get_request_by_id(db, request_id)
    if not request or request.employer_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return _build_response(request, current_user)


@router.get("/requests/{request_id}/report")
def download_report(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
):
    """Download a verification report as a text file."""
    request = get_request_by_id(db, request_id)
    if not request or request.employer_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    report_text = generate_verification_report(request)

    log_action(
        db,
        action="download_report",
        resource_type="verification_request",
        resource_id=request_id,
        user_id=current_user.id,
        username=current_user.username,
    )

    return PlainTextResponse(
        content=report_text,
        headers={
            "Content-Disposition": f"attachment; filename=verification_report_{request_id}.txt"
        },
    )


# ---- Notifications ----

@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("employer")),
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
    current_user: User = Depends(require_role("employer")),
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
    current_user: User = Depends(require_role("employer")),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .count()
    )
    return {"unread_count": count}


def _build_response(request, employer_user=None):
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

    emp_name = employer_user.full_name if employer_user else (
        request.employer.full_name if request.employer else None
    )

    return VerificationRequestResponse(
        id=request.id,
        employer_user_id=request.employer_user_id,
        candidate_id_number=request.candidate_id_number,
        reason=request.reason,
        status=request.status,
        created_at=request.created_at,
        updated_at=request.updated_at,
        items=items,
        employer_name=emp_name,
    )
