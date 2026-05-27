// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  full_name: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  full_name: string;
  id_number: string;
}

// Verification
export interface QueryItem {
  query_type: string;
  query_params: Record<string, string>;
}

export interface VerificationRequestCreate {
  candidate_id_number: string;
  reason?: string;
  items: QueryItem[];
}

export interface BulkVerificationCreate {
  reason?: string;
  candidate_id_numbers: string[];
  items: QueryItem[];
}

export interface VerificationItemResponse {
  id: number;
  query_type: string;
  query_params: string;
  consent_status: string;
  result: string | null;
  responded_at: string | null;
}

export interface VerificationRequestResponse {
  id: number;
  employer_user_id: number;
  candidate_id_number: string;
  reason: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  items: VerificationItemResponse[];
  employer_name: string | null;
  company_name: string | null;
}

export interface ConsentDecision {
  item_id: number;
  decision: 'approved' | 'declined';
}

export interface ConsentBatch {
  decisions: ConsentDecision[];
}

// Fraud
export interface FraudAlert {
  alert_type: string;
  severity: string;
  citizen_id_number: string;
  citizen_name: string;
  description: string;
  details: Record<string, unknown>;
}

export interface SystemStats {
  total_citizens: number;
  total_companies: number;
  total_verification_requests: number;
  pending_requests: number;
  completed_requests: number;
  total_fraud_alerts: number;
}

// Disputes
export interface DisputeCreate {
  verification_item_id?: number;
  dispute_type: string;
  field_disputed: string;
  reason: string;
  evidence_document_id?: number;
}

export interface DisputeResponse {
  id: number;
  citizen_id: number;
  verification_item_id: number | null;
  dispute_type: string;
  field_disputed: string;
  reason: string;
  evidence_document_id: number | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Block list
export interface BlockedCompanyResponse {
  id: number;
  company_id: number;
  company_name: string;
  blocked_at: string;
}

// Notifications
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Candidate profile
export interface EmploymentRecord {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  salary_bracket: string;
}

export interface QualificationRecord {
  qualification_type: string;
  field_of_study: string;
  institution: string;
  year_obtained: number;
  is_institution_registered: boolean;
}

export interface CriminalRecordResponse {
  case_number: string;
  offence: string;
  severity: string;
  date_convicted: string | null;
  is_cleared: boolean;
  is_interpol_wanted: boolean;
  interpol_notice_type: string | null;
  wanted_countries: string | null;
}

export interface CreditRecordResponse {
  credit_score: number;
  credit_score_band: string;
  has_defaults: boolean;
  has_judgements: boolean;
  has_insolvency: boolean;
  total_accounts: number;
  accounts_in_good_standing: number;
  last_updated: string;
}

export interface DriversLicenceResponse {
  licence_number: string;
  licence_code: string;
  issue_date: string;
  expiry_date: string;
  is_valid: boolean;
  restrictions: string | null;
  endorsements: number;
}

export interface ProfessionalRegResponse {
  body_name: string;
  registration_number: string;
  designation: string;
  registration_date: string;
  expiry_date: string | null;
  is_active: boolean;
  is_in_good_standing: boolean;
}

export interface AddressResponse {
  address_type: string;
  street_address: string;
  suburb: string | null;
  city: string;
  province: string;
  postal_code: string;
  is_current: boolean;
}

export interface ReferenceResponse {
  company_name: string;
  referee_name: string;
  referee_position: string;
  relationship_to_candidate: string;
  rating: string | null;
  is_verified: boolean;
}

export interface CandidateProfile {
  id_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  employments: EmploymentRecord[];
  qualifications: QualificationRecord[];
  criminal_records: CriminalRecordResponse[];
  credit_records: CreditRecordResponse[];
  drivers_licences: DriversLicenceResponse[];
  professional_registrations: ProfessionalRegResponse[];
  addresses: AddressResponse[];
  references: ReferenceResponse[];
}

// Admin
export interface UserCreate {
  username: string;
  password: string;
  full_name: string;
  role: string;
  citizen_id?: number;
  company_id?: number;
}

export interface UserUpdate {
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

export interface UserRecord {
  id: number;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  citizen_id: number | null;
  company_id: number | null;
}

export interface CompanyCreate {
  name: string;
  registration_number: string;
  is_registered?: boolean;
  sector?: string;
}

export interface CompanyUpdate {
  name?: string;
  is_registered?: boolean;
  sector?: string;
}

export interface CompanyRecord {
  id: number;
  name: string;
  registration_number: string;
  is_registered: boolean;
  sector: string | null;
}

export interface DisputeResolve {
  status: string;
  resolution_notes: string;
}

export interface AdminDisputeRecord {
  id: number;
  citizen_name: string;
  citizen_id_number: string;
  dispute_type: string;
  field_disputed: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string | null;
  user_id: number | null;
  username: string | null;
  action: string;
  resource_type: string | null;
  resource_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
}

export interface AdminRequestRecord {
  id: number;
  employer_user_id: number;
  employer_name: string | null;
  candidate_id_number: string;
  reason: string | null;
  status: string;
  item_count: number;
  created_at: string | null;
}

export interface VerificationHistoryEntry {
  request_id: number;
  employer_name: string | null;
  company_name: string | null;
  reason: string | null;
  query_type: string;
  consent_status: string;
  result: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface DocumentRecord {
  id: number;
  filename: string;
  document_type: string;
  uploaded_at: string | null;
}

export interface CompanyOption {
  id: number;
  name: string;
}
