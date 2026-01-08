import { useParams, Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUserById } from '@/api/users.api';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Briefcase, Loader2, Lock, Users } from 'lucide-react';
import { getFullStorageUrl } from '@/lib/storage';
import { ConnectionButton } from '@/components/connection-button';
import { cn } from '@/lib/utils';

export function MemberProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['member', memberId],
    queryFn: () => getUserById(memberId!),
    enabled: !!memberId,
  });

  useEffect(() => {
    if (user && memberId === user.id) {
      navigate('/app/profile', { replace: true });
    }
  }, [user, memberId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          to="/app/members"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to members
        </Link>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Member not found</h2>
          <p className="text-muted-foreground">This member may no longer be available.</p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(data.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const status = data.isConnected
    ? { label: 'Connected', className: 'bg-emerald-500/10 text-emerald-400' }
    : data.hasIncomingRequest
      ? { label: 'Respond', className: 'bg-blue-500/10 text-blue-400' }
      : data.hasOutgoingRequest
        ? { label: 'Pending', className: 'bg-amber-500/10 text-amber-400' }
        : { label: 'Not connected', className: 'bg-muted text-muted-foreground' };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/members"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to members
      </Link>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-8">
            <Avatar
              src={getFullStorageUrl(data.avatarUrl)}
              firstName={data.firstName}
              lastName={data.lastName}
              seed={data.id}
              size="xl"
              className="border-4 border-card"
            />

            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {data.firstName} {data.lastName}
              </h1>
              {data.position && <p className="text-muted-foreground">{data.position}</p>}
              <Badge variant="secondary" className={cn('mt-2 inline-flex', status.className)}>
                {status.label}
              </Badge>
            </div>

            <ConnectionButton
              userId={data.id}
              isConnected={data.isConnected}
              hasOutgoingRequest={data.hasOutgoingRequest}
              hasIncomingRequest={data.hasIncomingRequest}
              className="flex-shrink-0"
            />
          </div>

          {data.shortDescription && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">{data.shortDescription}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Link
              to={`/app/members/${data.id}/connections`}
              className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
            >
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground hover:text-primary">
                {data.totalConnections} {data.totalConnections === 1 ? 'connection' : 'connections'}
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Joined {joinDate}</span>
            </div>
            {data.position && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">{data.position}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
              {!data.isConnected && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            {data.isConnected ? (
              data.contactInfo && Object.keys(data.contactInfo).length > 0 ? (
                <div className="grid gap-2">
                  {Object.entries(data.contactInfo).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contact information provided.</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact details are visible once you are connected.
              </p>
            )}
          </div>

          {data.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

