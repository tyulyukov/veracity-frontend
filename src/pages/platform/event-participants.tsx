import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { useMyEvent, useEventParticipants } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { getFullStorageUrl } from '@/lib/storage';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function EventParticipantsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: event, isLoading: eventLoading, isError: eventError } = useMyEvent(eventId!);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEventParticipants(eventId!);

  useEffect(() => {
    if (user && user.role !== 'speaker') {
      toast.error('Only speakers can view event participants');
      navigate('/app/events');
    }
  }, [user, navigate]);

  if (user?.role !== 'speaker') {
    return null;
  }

  if (eventLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h3 className="font-semibold text-foreground mb-2">Event not found</h3>
          <p className="text-muted-foreground mb-4">
            The event you are looking for does not exist or you don't have permission to view its
            participants
          </p>
          <Link to="/app/my-events">
            <Button variant="outline">Back to My Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const allParticipants = data?.pages.flatMap((page) => page.participants ?? []) ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={`/app/events/${eventId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to event
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">{event.name}</h1>
        <p className="text-muted-foreground">
          {allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {allParticipants.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No participants yet</h3>
          <p className="text-muted-foreground">
            When people register for your event, they will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {allParticipants.map((participant) => {
              const registrationDate = new Date(participant.registrationCreatedAt);
              const formattedDate = registrationDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={participant.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Link to={`/app/members/${participant.id}`}>
                      <Avatar
                        src={getFullStorageUrl(participant.avatarUrl)}
                        firstName={participant.firstName}
                        lastName={participant.lastName}
                        seed={participant.id}
                        size="lg"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/app/members/${participant.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {participant.firstName} {participant.lastName}
                        </Link>
                        <Badge variant="secondary" className="text-xs">
                          {participant.role}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        Registered on {formattedDate}
                      </p>

                      {participant.comment && (
                        <div className="bg-muted/10 border border-border rounded-lg p-3">
                          <p className="text-sm text-muted-foreground mb-1 font-medium">
                            Registration comment:
                          </p>
                          <p className="text-sm text-foreground">{participant.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
