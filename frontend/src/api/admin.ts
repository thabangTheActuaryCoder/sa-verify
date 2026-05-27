import apiClient from './client';
import type {
  FraudAlert,
  SystemStats,
  UserCreate,
  UserUpdate,
  UserRecord,
  CompanyCreate,
  CompanyUpdate,
  CompanyRecord,
  DisputeResolve,
  AdminDisputeRecord,
  AuditLogEntry,
  AdminRequestRecord,
} from '../types';

export async function getFraudAlerts(): Promise<FraudAlert[]> {
  const res = await apiClient.get<FraudAlert[]>('/admin/fraud-alerts');
  return res.data;
}

export async function sendFraudNotifications() {
  const res = await apiClient.post('/admin/fraud-alerts/notify');
  return res.data;
}

export async function getStats(): Promise<SystemStats> {
  const res = await apiClient.get<SystemStats>('/admin/stats');
  return res.data;
}

export async function getAuditLog(limit = 100, offset = 0): Promise<AuditLogEntry[]> {
  const res = await apiClient.get<AuditLogEntry[]>(`/admin/audit-log?limit=${limit}&offset=${offset}`);
  return res.data;
}

export async function getRequests(): Promise<AdminRequestRecord[]> {
  const res = await apiClient.get<AdminRequestRecord[]>('/admin/requests');
  return res.data;
}

export async function getUsers(): Promise<UserRecord[]> {
  const res = await apiClient.get<UserRecord[]>('/admin/users');
  return res.data;
}

export async function createUser(data: UserCreate) {
  const res = await apiClient.post('/admin/users', data);
  return res.data;
}

export async function updateUser(userId: number, data: UserUpdate) {
  const res = await apiClient.put(`/admin/users/${userId}`, data);
  return res.data;
}

export async function getCompanies(): Promise<CompanyRecord[]> {
  const res = await apiClient.get<CompanyRecord[]>('/admin/companies');
  return res.data;
}

export async function createCompany(data: CompanyCreate) {
  const res = await apiClient.post('/admin/companies', data);
  return res.data;
}

export async function updateCompany(companyId: number, data: CompanyUpdate) {
  const res = await apiClient.put(`/admin/companies/${companyId}`, data);
  return res.data;
}

export async function getDisputes(statusFilter?: string): Promise<AdminDisputeRecord[]> {
  const params = statusFilter ? `?status_filter=${statusFilter}` : '';
  const res = await apiClient.get<AdminDisputeRecord[]>(`/admin/disputes${params}`);
  return res.data;
}

export async function resolveDispute(disputeId: number, data: DisputeResolve) {
  const res = await apiClient.put(`/admin/disputes/${disputeId}`, data);
  return res.data;
}
