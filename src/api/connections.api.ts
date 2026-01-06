import { apiPost, apiDelete, apiPatch, apiGet } from './client';
import type { ConnectionsQueryParams, PaginatedConnectionsResponse } from '@/types';

export interface ConnectionResponse {
  requesterUserId: string;
  targetUserId: string;
  status: 'pending' | 'approved' | 'ignored';
  createdAt: string;
  updatedAt: string;
  wasAutoApproved: boolean;
}

export interface RespondToConnectionDto {
  response: 'approved' | 'ignored';
}

export async function getConnections(
  userId: string,
  params?: ConnectionsQueryParams,
): Promise<PaginatedConnectionsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedConnectionsResponse>(`/connections/users/${userId}${query ? `?${query}` : ''}`);
}

export const connectionsApi = {
  sendRequest: (targetUserId: string) => apiPost<ConnectionResponse>(`/connections/${targetUserId}`),
  deleteRequest: (targetUserId: string) => apiDelete<void>(`/connections/${targetUserId}`),
  deleteConnection: (otherUserId: string) => apiDelete<void>(`/connections/${otherUserId}/connection`),
  respondToRequest: (requesterId: string, data: RespondToConnectionDto) =>
    apiPatch<ConnectionResponse, RespondToConnectionDto>(`/connections/${requesterId}/respond`, data),
  getConnections,
};

