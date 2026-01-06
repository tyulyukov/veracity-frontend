import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useConnections } from '@/hooks/use-connections';
import { useAuthStore } from '@/stores/auth.store';
import { getUserById } from '@/api/users.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { getFullStorageUrl } from '@/lib/storage';
import { ConnectionButton } from '@/components/connection-button';
import { cn } from '@/lib/utils';
import type { ConnectedUser } from '@/types';

export function ConnectionsPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const { user: currentUser } = useAuthStore();

  const isOwnProfile = !memberId;
  const targetUserId = isOwnProfile ? currentUser?.id : memberId;

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: () => getUserById(memberId!),
    enabled: !isOwnProfile && !!memberId,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useConnections(targetUserId ?? '');

  const allConnections = data?.pages.flatMap((page) => page.users) ?? [];

  const profileName = isOwnProfile
    ? 'My'
    : memberData
      ? `${memberData.firstName} ${memberData.lastName}'s`
      : '';

  const backPath = isOwnProfile ? '/app/profile' : `/app/members/${memberId}`;
  const backLabel = isOwnProfile ? 'Back to profile' : 'Back to member';

  if (isMemberLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {profileName} Connections
        </h1>
        <p className="text-muted-foreground">
          {allConnections.length} {allConnections.length === 1 ? 'connection' : 'connections'}
        </p>
      </div>

      {allConnections.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No connections yet</h3>
          <p className="text-muted-foreground">
            {isOwnProfile
              ? 'Connect with other members to grow your network.'
              : 'This member has no connections yet.'}
          </p>
          {isOwnProfile && (
            <Link to="/app/members">
              <Button className="mt-4">Browse Members</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allConnections.map((connection) => (
              <ConnectionCard key={connection.id} user={connection} isCurrentUser={connection.id === currentUser?.id} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ConnectionCard({ user, isCurrentUser }: { user: ConnectedUser; isCurrentUser: boolean }) {
  const status = isCurrentUser
    ? { label: 'You', className: 'bg-primary/10 text-primary' }
    : user.isConnected
      ? { label: 'Connected', className: 'bg-emerald-500/10 text-emerald-400' }
      : user.hasIncomingRequest
        ? { label: 'Respond', className: 'bg-blue-500/10 text-blue-400' }
        : user.hasOutgoingRequest
          ? { label: 'Pending', className: 'bg-amber-500/10 text-amber-400' }
          : null;

  const profileLink = isCurrentUser ? '/app/profile' : `/app/members/${user.id}`;

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <Link to={profileLink} className="shrink-0">
          <Avatar
            src={getFullStorageUrl(user.avatarUrl)}
            firstName={user.firstName}
            lastName={user.lastName}
            seed={user.id}
            size="lg"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={profileLink}>
                <h3 className="font-semibold text-foreground truncate">
                  {user.firstName} {user.lastName}
                </h3>
              </Link>
              {user.position && (
                <p className="text-sm text-muted-foreground truncate">{user.position}</p>
              )}
            </div>
            {status && (
              <Badge variant="secondary" className={cn('text-xs', status.className)}>
                {status.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {user.shortDescription && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {user.shortDescription}
        </p>
      )}

      {user.interests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.interests.slice(0, 3).map((interest) => (
            <Badge key={interest.id} variant="secondary" className="text-xs">
              {interest.name}
            </Badge>
          ))}
          {user.interests.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{user.interests.length - 3}
            </Badge>
          )}
        </div>
      )}

      {!isCurrentUser && (
        <div className="mt-4">
          <ConnectionButton
            userId={user.id}
            isConnected={user.isConnected}
            hasOutgoingRequest={user.hasOutgoingRequest}
            hasIncomingRequest={user.hasIncomingRequest}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

