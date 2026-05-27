import apiClient from './client';
import type {
  VerificationRequestCreate,
  VerificationRequestResponse,
  BulkVerificationCreate,
  NotificationResponse,
} from '../types';

export async function submitVerification(data: VerificationRequestCreate): Promise<VerificationRequestResponse> {
  const res = await apiClient.post<VerificationRequestResponse>('/employer/verify', data);
  return res.data;
}

export async function submitBulkVerification(data: BulkVerificationCreate) {
  const res = await apiClient.post('/employer/verify-bulk', data);
  return res.data;
}

export async function getRequests(statusFilter?: string, search?: string): Promise<VerificationRequestResponse[]> {
  const params = new URLSearchParams();
  if (statusFilter) params.set('status_filter', statusFilter);
  if (search) params.set('search', search);
  const res = await apiClient.get<VerificationRequestResponse[]>(`/employer/requests?${params}`);
  return res.data;
}

export async function getRequest(id: number): Promise<VerificationRequestResponse> {
  const res = await apiClient.get<VerificationRequestResponse>(`/employer/requests/${id}`);
  return res.data;
}

export async function downloadReport(requestId: number): Promise<string> {
  const res = await apiClient.get<string>(`/employer/requests/${requestId}/report`, {
    responseType: 'text',
  });
  return res.data;
}

export async function getNotifications(): Promise<NotificationResponse[]> {
  const res = await apiClient.get<NotificationResponse[]>('/employer/notifications');
  return res.data;
}

export async function markNotificationRead(id: number) {
  const res = await apiClient.post(`/employer/notifications/${id}/read`);
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ unread_count: number }>('/employer/notifications/unread-count');
  return res.data.unread_count;
}
