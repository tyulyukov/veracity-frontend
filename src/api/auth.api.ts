import { apiPost } from './client';
import type { RegisterPayload, LoginPayload } from '@/types';

export async function register(payload: RegisterPayload): Promise<{ userId: string }> {
  return apiPost<{ userId: string }, RegisterPayload>('/users/auth/register', payload);
}

export async function login(payload: LoginPayload): Promise<{ message: string }> {
  return apiPost<{ message: string }, LoginPayload>('/users/auth/login', payload);
}

export async function logout(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/users/auth/logout');
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }, { email: string }>('/users/auth/forgot-password', { email });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiPost<{ message: string }, { email: string; code: string; newPassword: string }>(
    '/users/auth/reset-password',
    { email, code, newPassword }
  );
}

