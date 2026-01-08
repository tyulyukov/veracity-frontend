import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  EventResponse,
  CreateEventPayload,
  UpdateEventPayload,
  RegisterEventPayload,
  EventsQueryParams,
  PaginatedEventsResponse,
  PaginatedParticipantsResponse,
} from '@/types';

export async function getEvents(params?: EventsQueryParams): Promise<PaginatedEventsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params?.filter) {
    searchParams.set('filter', params.filter);
  }

  const query = searchParams.toString();
  return apiGet<PaginatedEventsResponse>(`/events${query ? `?${query}` : ''}`);
}

export async function getEventById(eventId: string): Promise<EventResponse> {
  return apiGet<EventResponse>(`/events/${eventId}`);
}

export async function registerForEvent(
  eventId: string,
  payload?: RegisterEventPayload,
): Promise<void> {
  return apiPost<void, RegisterEventPayload>(`/events/${eventId}/register`, payload);
}

export async function unregisterFromEvent(eventId: string): Promise<void> {
  return apiDelete<void>(`/events/${eventId}/register`);
}

export async function getMyEvents(params?: EventsQueryParams): Promise<PaginatedEventsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedEventsResponse>(`/events/my${query ? `?${query}` : ''}`);
}

export async function getMyEventById(eventId: string): Promise<EventResponse> {
  return apiGet<EventResponse>(`/events/my/${eventId}`);
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  return apiPost<EventResponse, CreateEventPayload>('/events', payload);
}

export async function updateEvent(
  eventId: string,
  payload: UpdateEventPayload,
): Promise<EventResponse> {
  return apiPatch<EventResponse, UpdateEventPayload>(`/events/${eventId}`, payload);
}

export async function deleteEvent(eventId: string): Promise<void> {
  return apiDelete<void>(`/events/${eventId}`);
}

export async function getEventParticipants(
  eventId: string,
  params?: { cursor?: string; limit?: number },
): Promise<PaginatedParticipantsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedParticipantsResponse>(
    `/events/${eventId}/participants${query ? `?${query}` : ''}`,
  );
}

export const eventsApi = {
  getEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getMyEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
};
