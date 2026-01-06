import { Bell, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { usePendingRequests } from '@/hooks/use-pending-requests';
import { getFullStorageUrl } from '@/lib/storage';
import { connectionsApi } from '@/api/connections.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';

export function NotificationsDropdown() {
  const { data, isLoading } = usePendingRequests();
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: ({ userId, response }: { userId: string; response: 'approved' | 'ignored' }) =>
      connectionsApi.respondToRequest(userId, { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const pendingCount = data?.users.length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Connection Requests</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingCount === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              No pending connection requests
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-card/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Link to={`/app/members/${user.id}`}>
                      <Avatar
                        src={getFullStorageUrl(user.avatarUrl)}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        seed={user.id}
                        size="md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/app/members/${user.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {user.firstName} {user.lastName}
                      </Link>
                      {user.position && (
                        <p className="text-xs text-muted-foreground mt-0.5">{user.position}</p>
                      )}
                      {user.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.interests.slice(0, 3).map((interest) => (
                            <span
                              key={interest.id}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                            >
                              {interest.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() =>
                            respondMutation.mutate({ userId: user.id, response: 'approved' })
                          }
                          disabled={respondMutation.isPending}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            respondMutation.mutate({ userId: user.id, response: 'ignored' })
                          }
                          disabled={respondMutation.isPending}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Ignore
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

