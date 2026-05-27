import apiClient from './client';
import type { LoginRequest, TokenResponse, RegisterRequest } from '../types';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<{ message: string; username: string }> {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}
