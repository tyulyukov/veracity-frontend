import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/users.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Briefcase, Loader2 } from 'lucide-react';

export function MemberProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const result = await getUsers({ limit: 100 });
      const member = result.users.find((u) => u.id === memberId);
      if (!member) throw new Error('Member not found');
      return member;
    },
    enabled: !!memberId,
  });

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
              src={data.avatarUrl}
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
            </div>

            <Button disabled>Connect (Coming Soon)</Button>
          </div>

          {data.shortDescription && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">{data.shortDescription}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
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

