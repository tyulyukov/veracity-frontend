import { apiGet, apiPatch } from './client';
import type { User, OtherUserDetail, UpdateProfilePayload, UsersQueryParams, PaginatedUsersResponse } from '@/types';

export async function getMe(): Promise<User> {
  return apiGet<User>('/users/me');
}

export async function updateMe(payload: UpdateProfilePayload): Promise<User> {
  return apiPatch<User, UpdateProfilePayload>('/users/me', payload);
}

export async function getUsers(params?: UsersQueryParams): Promise<PaginatedUsersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params?.interestIds?.length) {
    params.interestIds.forEach((id) => searchParams.append('interestIds', id));
  }
  if (params?.search) {
    searchParams.set('search', params.search);
  }
  if (params?.position) {
    searchParams.set('position', params.position);
  }
  if (params?.connectionFilter) {
    searchParams.set('connectionFilter', params.connectionFilter);
  }

  const query = searchParams.toString();
  return apiGet<PaginatedUsersResponse>(`/users${query ? `?${query}` : ''}`);
}

export async function getUserById(userId: string): Promise<OtherUserDetail> {
  return apiGet<OtherUserDetail>(`/users/${userId}`);
}

