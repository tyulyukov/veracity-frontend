import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { connectionsApi, getConnections } from '@/api/connections.api';

export function useSendConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectionsApi.sendRequest,
    onSuccess: (data) => {
      if (data.wasAutoApproved) {
        toast.success('Connection request approved! You are now connected.');
      } else {
        toast.success('Connection request sent');
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: () => {
      toast.error('Failed to send connection request');
    },
  });
}

export function useDeleteConnectionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectionsApi.deleteRequest,
    onSuccess: () => {
      toast.success('Connection request withdrawn');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: () => {
      toast.error('Failed to delete connection request');
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectionsApi.deleteConnection,
    onSuccess: () => {
      toast.success('Connection removed');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    },
    onError: (error) => {
      console.error('Delete connection error:', error);
      toast.error('Failed to remove connection');
    },
  });
}

export function useRespondToConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requesterId, response }: { requesterId: string; response: 'approved' | 'ignored' }) =>
      connectionsApi.respondToRequest(requesterId, { response }),
    onSuccess: (_, { response }) => {
      toast.success(response === 'approved' ? 'Connection approved' : 'Request ignored');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['member'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: () => {
      toast.error('Failed to respond to connection request');
    },
  });
}

export function useConnections(userId: string) {
  return useInfiniteQuery({
    queryKey: ['connections', userId],
    queryFn: ({ pageParam }) =>
      getConnections(userId, {
        cursor: pageParam,
        limit: 12,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

