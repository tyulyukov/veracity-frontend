export interface Interest {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  position: string | null;
  contactInfo: Record<string, string> | null;
  shortDescription: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  lastActivityAt: string | null;
  interests: Interest[];
  totalConnections: number;
}

export interface OtherUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  position: string | null;
  shortDescription: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  lastActivityAt: string | null;
  interests: Interest[];
  isConnected: boolean;
  hasOutgoingRequest: boolean;
  hasIncomingRequest: boolean;
}

export interface OtherUserDetail extends OtherUser {
  contactInfo: Record<string, string> | null;
  totalConnections: number;
}

export type UserStatus = 'pending' | 'active' | 'inactive' | 'banned';
export type UserRole = 'user' | 'speaker' | 'admin' | 'owner';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  position?: string;
  contactInfo?: Record<string, string>;
  interestIds: string[];
  shortDescription?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  position?: string;
  contactInfo?: Record<string, string>;
  shortDescription?: string;
  interestIds?: string[];
}

export interface UsersQueryParams {
  cursor?: string;
  limit?: number;
  interestIds?: string[];
  search?: string;
  position?: string;
  connectionFilter?: 'all' | 'sent_requests' | 'received_requests' | 'connected';
}

export interface PaginatedUsersResponse {
  users: OtherUser[];
  nextCursor: string | null;
}

export interface ConnectedUser extends OtherUser {
  connectionCreatedAt: string;
}

export interface ConnectionsQueryParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedConnectionsResponse {
  users: ConnectedUser[];
  nextCursor: string | null;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export type StorageEntity = 'users';
export type StorageField = 'avatar';

export interface UploadFileResponse {
  path: string;
}

export const STORAGE_BASE_URL = 'https://storage.veracity.tyulyukov.com';

