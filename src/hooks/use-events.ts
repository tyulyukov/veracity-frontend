import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { eventsApi } from '@/api/events.api';
import type { CreateEventPayload, UpdateEventPayload } from '@/types';

export function useEvents(filter: 'all' | 'registered' = 'all') {
  return useInfiniteQuery({
    queryKey: ['events', filter],
    queryFn: ({ pageParam }) =>
      eventsApi.getEvents({
        cursor: pageParam,
        limit: 12,
        filter,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useMyEvents() {
  return useInfiniteQuery({
    queryKey: ['my-events'],
    queryFn: ({ pageParam }) =>
      eventsApi.getMyEvents({
        cursor: pageParam,
        limit: 12,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useMyEvent(eventId: string) {
  return useQuery({
    queryKey: ['my-event', eventId],
    queryFn: () => eventsApi.getMyEventById(eventId),
    enabled: !!eventId,
  });
}

export function useEventParticipants(eventId: string) {
  return useInfiniteQuery({
    queryKey: ['event-participants', eventId],
    queryFn: ({ pageParam }) =>
      eventsApi.getEventParticipants(eventId, {
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!eventId,
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, comment }: { eventId: string; comment?: string }) =>
      eventsApi.registerForEvent(eventId, comment ? { comment } : undefined),
    onSuccess: (_, { eventId }) => {
      toast.success('Successfully registered for event');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to register for event';
      toast.error(errorMessage);
    },
  });
}

export function useUnregisterFromEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.unregisterFromEvent(eventId),
    onSuccess: (_, eventId) => {
      toast.success('Unregistered from event');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to unregister from event';
      toast.error(errorMessage);
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.createEvent(payload),
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: UpdateEventPayload }) =>
      eventsApi.updateEvent(eventId, payload),
    onSuccess: (_, { eventId }) => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to update event';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to delete event';
      toast.error(errorMessage);
    },
  });
}
