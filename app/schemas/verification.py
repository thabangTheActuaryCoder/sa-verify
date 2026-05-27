from datetime import datetime

from pydantic import BaseModel


# ---- Verification ----

class QueryItem(BaseModel):
    query_type: str
    query_params: dict


class VerificationRequestCreate(BaseModel):
    candidate_id_number: str
    reason: str | None = None
    items: list[QueryItem]


class BulkVerificationCreate(BaseModel):
    """Submit verification requests for multiple candidates at once."""
    reason: str | None = None
    candidate_id_numbers: list[str]
    items: list[QueryItem]


class VerificationItemResponse(BaseModel):
    id: int
    query_type: str
    query_params: str
    consent_status: str
    result: str | None = None
    responded_at: datetime | None = None

    class Config:
        from_attributes = True


class VerificationRequestResponse(BaseModel):
    id: int
    employer_user_id: int
    candidate_id_number: str
    reason: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    items: list[VerificationItemResponse] = []
    employer_name: str | None = None
    company_name: str | None = None

    class Config:
        from_attributes = True


class ConsentDecision(BaseModel):
    item_id: int
    decision: str  # approved or declined


class ConsentBatch(BaseModel):
    decisions: list[ConsentDecision]


# ---- Fraud ----

class FraudAlert(BaseModel):
    alert_type: str
    severity: str
    citizen_id_number: str
    citizen_name: str
    description: str
    details: dict = {}


class SystemStats(BaseModel):
    total_citizens: int
    total_companies: int
    total_verification_requests: int
    pending_requests: int
    completed_requests: int
    total_fraud_alerts: int


# ---- Disputes ----

class DisputeCreate(BaseModel):
    verification_item_id: int | None = None
    dispute_type: str
    field_disputed: str
    reason: str
    evidence_document_id: int | None = None


class DisputeResponse(BaseModel):
    id: int
    citizen_id: int
    verification_item_id: int | None = None
    dispute_type: str
    field_disputed: str
    reason: str
    evidence_document_id: int | None = None
    status: str
    resolution_notes: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DisputeResolve(BaseModel):
    status: str  # resolved or rejected
    resolution_notes: str


# ---- Block list ----

class BlockCompanyRequest(BaseModel):
    company_id: int


class BlockedCompanyResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    blocked_at: datetime


# ---- Notifications ----

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    link: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Candidate profile ----

class EmploymentRecord(BaseModel):
    company_name: str
    job_title: str
    start_date: str
    end_date: str | None
    is_current: bool
    salary_bracket: str


class QualificationRecord(BaseModel):
    qualification_type: str
    field_of_study: str
    institution: str
    year_obtained: int
    is_institution_registered: bool


class CriminalRecordResponse(BaseModel):
    case_number: str
    offence: str
    severity: str
    date_convicted: str | None
    is_cleared: bool
    is_interpol_wanted: bool
    interpol_notice_type: str | None
    wanted_countries: str | None


class CreditRecordResponse(BaseModel):
    credit_score: int
    credit_score_band: str
    has_defaults: bool
    has_judgements: bool
    has_insolvency: bool
    total_accounts: int
    accounts_in_good_standing: int
    last_updated: datetime


class DriversLicenceResponse(BaseModel):
    licence_number: str
    licence_code: str
    issue_date: str
    expiry_date: str
    is_valid: bool
    restrictions: str | None
    endorsements: int


class ProfessionalRegResponse(BaseModel):
    body_name: str
    registration_number: str
    designation: str
    registration_date: str
    expiry_date: str | None
    is_active: bool
    is_in_good_standing: bool


class AddressResponse(BaseModel):
    address_type: str
    street_address: str
    suburb: str | None
    city: str
    province: str
    postal_code: str
    is_current: bool


class ReferenceResponse(BaseModel):
    company_name: str
    referee_name: str
    referee_position: str
    relationship_to_candidate: str
    rating: str | None
    is_verified: bool


class CandidateProfile(BaseModel):
    id_number: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    employments: list[EmploymentRecord] = []
    qualifications: list[QualificationRecord] = []
    criminal_records: list[CriminalRecordResponse] = []
    credit_records: list[CreditRecordResponse] = []
    drivers_licences: list[DriversLicenceResponse] = []
    professional_registrations: list[ProfessionalRegResponse] = []
    addresses: list[AddressResponse] = []
    references: list[ReferenceResponse] = []


# ---- Admin user/company management ----

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    citizen_id: int | None = None
    company_id: int | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None


class CompanyCreate(BaseModel):
    name: str
    registration_number: str
    is_registered: bool = True
    sector: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    is_registered: bool | None = None
    sector: str | None = None


# ---- Registration ----

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    id_number: str


# ---- Verification history ----

class VerificationHistoryEntry(BaseModel):
    request_id: int
    employer_name: str | None
    company_name: str | None
    reason: str | None
    query_type: str
    consent_status: str
    result: str | None
    created_at: datetime
    responded_at: datetime | None
