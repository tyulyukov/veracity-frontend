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

export type StorageEntity = 'users' | 'events' | 'posts';
export type StorageField = 'avatar' | 'event_image' | 'post_image';

export interface UploadFileResponse {
  path: string;
}

export const STORAGE_BASE_URL = 'https://storage.veracity.tyulyukov.com';

export interface EventSpeaker {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface EventListItem {
  id: string;
  name: string;
  isOnline: boolean;
  eventDate: string;
  location: string | null;
  link: string | null;
  imageUrls: string[];
  limitParticipants: number | null;
  participantCount: number;
  speaker?: EventSpeaker;
  isRegistered?: boolean;
}

export interface EventResponse extends EventListItem {
  description: string | null;
  tags: string[];
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  comment: string | null;
  registrationCreatedAt: string;
}

export interface CreateEventPayload {
  name: string;
  isOnline: boolean;
  eventDate: string;
  location?: string;
  link?: string;
  description?: string;
  imageUrls?: string[];
  tags?: string[];
  limitParticipants?: number;
}

export interface UpdateEventPayload {
  name?: string;
  isOnline?: boolean;
  eventDate?: string;
  location?: string;
  link?: string;
  description?: string;
  imageUrls?: string[];
  tags?: string[];
  limitParticipants?: number;
}

export interface RegisterEventPayload {
  comment?: string;
}

export interface EventsQueryParams {
  cursor?: string;
  limit?: number;
  filter?: 'all' | 'registered';
}

export interface PaginatedEventsResponse {
  events: EventListItem[];
  nextCursor: string | null;
}

export interface PaginatedParticipantsResponse {
  participants: EventParticipant[];
  nextCursor: string | null;
}

export interface PostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface Post {
  id: string;
  text: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  author: PostAuthor;
}

export interface MyPost {
  id: string;
  text: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  author: PostAuthor;
}

export interface CreatePostPayload {
  text?: string;
  imageUrls?: string[];
}

export interface UpdatePostPayload {
  text?: string;
  imageUrls?: string[];
}

export interface CreateCommentPayload {
  text: string;
}

export interface UpdateCommentPayload {
  text: string;
}

export interface PostsQueryParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  nextCursor: string | null;
}

export interface PaginatedMyPostsResponse {
  posts: MyPost[];
  nextCursor: string | null;
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  nextCursor: string | null;
}

