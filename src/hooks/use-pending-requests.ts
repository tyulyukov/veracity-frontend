import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/users.api';

export function usePendingRequests() {
  return useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => getUsers({ connectionFilter: 'received_requests', limit: 50 }),
    refetchInterval: 30000,
  });
}

