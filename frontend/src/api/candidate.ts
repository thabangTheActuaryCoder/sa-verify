import apiClient from './client';
import type {
  VerificationRequestResponse,
  ConsentBatch,
  CandidateProfile,
  VerificationHistoryEntry,
  DisputeCreate,
  DisputeResponse,
  BlockedCompanyResponse,
  NotificationResponse,
  DocumentRecord,
  CompanyOption,
} from '../types';

export async function getProfile(): Promise<CandidateProfile> {
  const res = await apiClient.get<CandidateProfile>('/candidate/profile');
  return res.data;
}

export async function getRequests(): Promise<VerificationRequestResponse[]> {
  const res = await apiClient.get<VerificationRequestResponse[]>('/candidate/requests');
  return res.data;
}

export async function getRequest(id: number): Promise<VerificationRequestResponse> {
  const res = await apiClient.get<VerificationRequestResponse>(`/candidate/requests/${id}`);
  return res.data;
}

export async function submitConsent(batch: ConsentBatch) {
  const res = await apiClient.post('/candidate/consent', batch);
  return res.data;
}

export async function getHistory(): Promise<VerificationHistoryEntry[]> {
  const res = await apiClient.get<VerificationHistoryEntry[]>('/candidate/history');
  return res.data;
}

export async function getDisputes(): Promise<DisputeResponse[]> {
  const res = await apiClient.get<DisputeResponse[]>('/candidate/disputes');
  return res.data;
}

export async function createDispute(data: DisputeCreate): Promise<DisputeResponse> {
  const res = await apiClient.post<DisputeResponse>('/candidate/disputes', data);
  return res.data;
}

export async function getBlockedCompanies(): Promise<BlockedCompanyResponse[]> {
  const res = await apiClient.get<BlockedCompanyResponse[]>('/candidate/blocked-companies');
  return res.data;
}

export async function blockCompany(companyId: number) {
  const res = await apiClient.post('/candidate/blocked-companies', { company_id: companyId });
  return res.data;
}

export async function unblockCompany(blockId: number) {
  const res = await apiClient.delete(`/candidate/blocked-companies/${blockId}`);
  return res.data;
}

export async function getNotifications(): Promise<NotificationResponse[]> {
  const res = await apiClient.get<NotificationResponse[]>('/candidate/notifications');
  return res.data;
}

export async function markNotificationRead(id: number) {
  const res = await apiClient.post(`/candidate/notifications/${id}/read`);
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ unread_count: number }>('/candidate/notifications/unread-count');
  return res.data.unread_count;
}

export async function uploadDocument(documentType: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/candidate/documents?document_type=${encodeURIComponent(documentType)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  const res = await apiClient.get<DocumentRecord[]>('/candidate/documents');
  return res.data;
}

export async function getCompanies(): Promise<CompanyOption[]> {
  const res = await apiClient.get<CompanyOption[]>('/candidate/companies');
  return res.data;
}
