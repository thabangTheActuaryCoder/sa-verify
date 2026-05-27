import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.citizen import Citizen
from app.models.company import Company
from app.models.employment import Employment
from app.models.qualification import Qualification
from app.models.criminal_record import CriminalRecord
from app.models.credit_record import CreditRecord
from app.models.drivers_licence import DriversLicence
from app.models.professional_registration import ProfessionalRegistration
from app.models.address import Address
from app.models.reference import Reference
from app.models.blocked_company import BlockedCompany
from app.models.verification import VerificationRequest, VerificationItem
from app.models.notification import Notification
from app.models.user import User
from app.services.id_validator import validate_sa_id


def is_company_blocked(db: Session, citizen_id: int, company_id: int) -> bool:
    """Check if a candidate has blocked the employer's company."""
    if not company_id:
        return False
    return (
        db.query(BlockedCompany)
        .filter(
            BlockedCompany.citizen_id == citizen_id,
            BlockedCompany.company_id == company_id,
        )
        .first()
        is not None
    )


def create_verification_request(
    db: Session,
    employer_user_id: int,
    candidate_id_number: str,
    items: list[dict],
    reason: str | None = None,
) -> VerificationRequest:
    request = VerificationRequest(
        employer_user_id=employer_user_id,
        candidate_id_number=candidate_id_number,
        reason=reason,
        status="pending",
    )
    db.add(request)
    db.flush()

    for item in items:
        vi = VerificationItem(
            request_id=request.id,
            query_type=item["query_type"],
            query_params=json.dumps(item["query_params"]),
        )
        db.add(vi)

    # Create notification for candidate if they have a user account
    citizen = db.query(Citizen).filter(Citizen.id_number == candidate_id_number).first()
    if citizen and citizen.user:
        employer_user = db.query(User).filter(User.id == employer_user_id).first()
        employer_name = employer_user.full_name if employer_user else "An employer"
        db.add(Notification(
            user_id=citizen.user.id,
            title="New Verification Request",
            message=f"{employer_name} has submitted a verification request with {len(items)} queries. Please review and respond.",
            notification_type="verification_request",
            link=f"/candidate/request/{request.id}",
        ))

    db.commit()
    db.refresh(request)
    return request


def get_requests_for_candidate(
    db: Session, id_number: str
) -> list[VerificationRequest]:
    return (
        db.query(VerificationRequest)
        .filter(VerificationRequest.candidate_id_number == id_number)
        .order_by(VerificationRequest.created_at.desc())
        .all()
    )


def get_requests_by_employer(
    db: Session,
    employer_user_id: int,
    status_filter: str | None = None,
    search: str | None = None,
) -> list[VerificationRequest]:
    query = db.query(VerificationRequest).filter(
        VerificationRequest.employer_user_id == employer_user_id
    )
    if status_filter:
        query = query.filter(VerificationRequest.status == status_filter)
    if search:
        query = query.filter(
            VerificationRequest.candidate_id_number.contains(search)
        )
    return query.order_by(VerificationRequest.created_at.desc()).all()


def get_request_by_id(db: Session, request_id: int) -> VerificationRequest | None:
    return (
        db.query(VerificationRequest)
        .filter(VerificationRequest.id == request_id)
        .first()
    )


def process_consent(
    db: Session,
    item_id: int,
    decision: str,
    candidate_id_number: str,
) -> VerificationItem | None:
    item = db.query(VerificationItem).filter(VerificationItem.id == item_id).first()
    if not item:
        return None

    request = item.request
    if request.candidate_id_number != candidate_id_number:
        return None

    if item.consent_status != "pending":
        return None

    item.consent_status = decision
    item.responded_at = datetime.utcnow()

    if decision == "approved":
        item.result = _evaluate_query(db, candidate_id_number, item.query_type, item.query_params)
    else:
        item.result = None

    # Update request status
    all_items = request.items
    statuses = {i.consent_status for i in all_items}
    if "pending" not in statuses:
        request.status = "completed"
    elif statuses != {"pending"}:
        request.status = "partial"

    request.updated_at = datetime.utcnow()

    # Notify the employer that consent was given
    employer_user = request.employer
    if employer_user:
        citizen = db.query(Citizen).filter(Citizen.id_number == candidate_id_number).first()
        cit_name = f"{citizen.first_name} {citizen.last_name}" if citizen else candidate_id_number
        db.add(Notification(
            user_id=employer_user.id,
            title="Consent Response Received",
            message=f"{cit_name} has {decision} a query item in request #{request.id}.",
            notification_type="consent_given",
            link=f"/employer/request/{request.id}",
        ))

    db.commit()
    db.refresh(item)
    return item


def _evaluate_query(
    db: Session,
    id_number: str,
    query_type: str,
    query_params_json: str,
) -> str:
    params = json.loads(query_params_json)
    citizen = db.query(Citizen).filter(Citizen.id_number == id_number).first()
    if not citizen:
        return "No"

    if query_type == "id_verification":
        validation = validate_sa_id(id_number)
        return "Yes" if validation["is_valid"] and citizen.is_alive else "No"

    elif query_type == "employment_check":
        company_name = params.get("company_name", "")
        emp = (
            db.query(Employment)
            .join(Company)
            .filter(
                Employment.citizen_id == citizen.id,
                Company.name.ilike(f"%{company_name}%"),
            )
            .first()
        )
        return "Yes" if emp else "No"

    elif query_type == "employment_period":
        company_name = params.get("company_name", "")
        start_year = int(params.get("start_year", 0))
        end_year = int(params.get("end_year", 9999))
        emp = (
            db.query(Employment)
            .join(Company)
            .filter(
                Employment.citizen_id == citizen.id,
                Company.name.ilike(f"%{company_name}%"),
            )
            .first()
        )
        if not emp:
            return "No"
        emp_start = emp.start_date.year
        emp_end = emp.end_date.year if emp.end_date else datetime.utcnow().year
        return "Yes" if emp_start <= start_year and emp_end >= end_year else "No"

    elif query_type == "salary_bracket":
        company_name = params.get("company_name", "")
        bracket = params.get("bracket", "")
        emp = (
            db.query(Employment)
            .join(Company)
            .filter(
                Employment.citizen_id == citizen.id,
                Company.name.ilike(f"%{company_name}%"),
            )
            .first()
        )
        if not emp:
            return "No"
        return "Yes" if emp.salary_bracket == bracket else "No"

    elif query_type == "qualification_check":
        qual_type = params.get("qualification_type", "")
        institution = params.get("institution", "")
        q = (
            db.query(Qualification)
            .filter(
                Qualification.citizen_id == citizen.id,
                Qualification.qualification_type.ilike(f"%{qual_type}%"),
                Qualification.institution.ilike(f"%{institution}%"),
            )
            .first()
        )
        return "Yes" if q else "No"

    elif query_type == "criminal_record_check":
        records = [r for r in citizen.criminal_records if not r.is_cleared]
        return "Yes" if records else "No"

    elif query_type == "interpol_check":
        wanted = [r for r in citizen.criminal_records if r.is_interpol_wanted]
        return "Yes" if wanted else "No"

    elif query_type == "credit_check":
        band = params.get("minimum_band", "")
        band_order = {"poor": 0, "fair": 1, "good": 2, "excellent": 3}
        credit = next(iter(citizen.credit_records), None)
        if not credit:
            return "No"
        if not band:
            return "Yes" if not credit.has_defaults and not credit.has_judgements else "No"
        citizen_level = band_order.get(credit.credit_score_band, -1)
        required_level = band_order.get(band, 0)
        return "Yes" if citizen_level >= required_level else "No"

    elif query_type == "drivers_licence_check":
        code = params.get("licence_code", "")
        licence = next(
            (l for l in citizen.drivers_licences if l.is_valid and (not code or l.licence_code == code)),
            None,
        )
        return "Yes" if licence else "No"

    elif query_type == "professional_registration_check":
        body = params.get("body_name", "")
        reg = next(
            (r for r in citizen.professional_registrations
             if r.is_active and r.is_in_good_standing and body.lower() in r.body_name.lower()),
            None,
        )
        return "Yes" if reg else "No"

    elif query_type == "address_verification":
        city = params.get("city", "")
        province = params.get("province", "")
        addr = next(
            (a for a in citizen.addresses
             if a.is_current
             and (not city or city.lower() in a.city.lower())
             and (not province or province.lower() in a.province.lower())),
            None,
        )
        return "Yes" if addr else "No"

    elif query_type == "reference_check":
        company_name = params.get("company_name", "")
        ref = next(
            (r for r in citizen.references
             if r.is_verified and company_name.lower() in r.company.name.lower()),
            None,
        )
        return "Yes" if ref else "No"

    return "No"


def get_all_requests(db: Session) -> list[VerificationRequest]:
    return (
        db.query(VerificationRequest)
        .order_by(VerificationRequest.created_at.desc())
        .all()
    )


def get_verification_history(db: Session, id_number: str) -> list[dict]:
    """Get full verification history for a candidate across all employers."""
    requests = (
        db.query(VerificationRequest)
        .filter(VerificationRequest.candidate_id_number == id_number)
        .order_by(VerificationRequest.created_at.desc())
        .all()
    )

    history = []
    for req in requests:
        employer = req.employer
        for item in req.items:
            history.append({
                "request_id": req.id,
                "employer_name": employer.full_name if employer else None,
                "reason": req.reason,
                "query_type": item.query_type,
                "consent_status": item.consent_status,
                "result": item.result,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "responded_at": item.responded_at.isoformat() if item.responded_at else None,
            })

    return history
