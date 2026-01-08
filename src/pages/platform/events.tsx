import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Calendar, Loader2, Plus } from 'lucide-react';
import { useEvents, useMyEvents, useDeleteEvent } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'registered' | 'my-events';

export function EventsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isSpeaker = user?.role === 'speaker';

  const publicEventsQuery = useEvents(activeFilter === 'all' ? 'all' : 'registered');
  const myEventsQuery = useMyEvents();
  const deleteMutation = useDeleteEvent();

  const isMyEventsTab = activeFilter === 'my-events';
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = isMyEventsTab
    ? myEventsQuery
    : publicEventsQuery;

  const allEvents = data?.pages.flatMap((page) => page.events) ?? [];

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setEventToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const getEmptyStateMessage = () => {
    if (activeFilter === 'registered') {
      return {
        title: 'No registered events',
        description: 'You have not registered for any events yet',
      };
    }
    if (activeFilter === 'my-events') {
      return {
        title: 'No events yet',
        description: 'Create your first event to get started',
        showCreateButton: true,
      };
    }
    return {
      title: 'No events found',
      description: 'Check back later for upcoming events',
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Events</h1>
            <p className="text-muted-foreground">
              {isMyEventsTab ? 'Manage your events' : 'Discover and register for events'}
            </p>
          </div>

          {isSpeaker && isMyEventsTab && (
            <Link to="/app/my-events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              activeFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
            )}
          >
            All Events
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('registered')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
              activeFilter === 'registered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
            )}
          >
            My Registrations
          </button>
          {isSpeaker && (
            <button
              type="button"
              onClick={() => setActiveFilter('my-events')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                activeFilter === 'my-events'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/30 hover:text-foreground',
              )}
            >
              My Events
            </button>
          )}
        </div>
      </div>

      {allEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">{emptyState.title}</h3>
          <p className="text-muted-foreground mb-6">{emptyState.description}</p>
          {emptyState.showCreateButton && (
            <Link to="/app/my-events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant={isMyEventsTab ? 'owned' : 'default'}
                onEdit={isMyEventsTab ? () => navigate(`/app/my-events/${event.id}/edit`) : undefined}
                onDelete={isMyEventsTab ? () => handleDeleteClick(event.id) : undefined}
                onViewParticipants={
                  isMyEventsTab ? () => navigate(`/app/my-events/${event.id}/participants`) : undefined
                }
              />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone. All
              participants will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
