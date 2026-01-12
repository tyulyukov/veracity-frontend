import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useMyEvent, useUpdateEvent } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { WysiwygEditor } from '@/components/wysiwyg-editor';
import { MultiImageUpload } from '@/components/multi-image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { EventResponse } from '@/types';

export function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useMyEvent(eventId!);

  useEffect(() => {
    if (user && user.role !== 'speaker') {
      toast.error('Only speakers can edit events');
      navigate('/app/events');
    }
  }, [user, navigate]);

  if (user?.role !== 'speaker') {
    return null;
  }

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
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h3 className="font-semibold text-foreground mb-2">Event not found</h3>
          <p className="text-muted-foreground mb-4">
            The event you are trying to edit does not exist or you don't have permission to edit it
          </p>
          <Link to="/app/my-events">
            <Button variant="outline">Back to My Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <EditEventForm event={data} eventId={eventId!} />;
}

interface EditEventFormProps {
  event: EventResponse;
  eventId: string;
}

function EditEventForm({ event, eventId }: EditEventFormProps) {
  const navigate = useNavigate();
  const updateMutation = useUpdateEvent();

  const initialDate = new Date(event.eventDate);
  const initialDateString = initialDate.toISOString().split('T')[0];
  const initialTimeString = initialDate.toTimeString().substring(0, 5);

  const [name, setName] = useState(event.name);
  const [isOnline, setIsOnline] = useState(event.isOnline);
  const [eventDate, setEventDate] = useState(initialDateString);
  const [eventTime, setEventTime] = useState(initialTimeString);
  const [location, setLocation] = useState(event.location || '');
  const [link, setLink] = useState(event.link || '');
  const [description, setDescription] = useState(event.description || '');
  const [tags, setTags] = useState(event.tags.join(', '));
  const [limitParticipants, setLimitParticipants] = useState(event.limitParticipants?.toString() || '');
  const [imageUrls, setImageUrls] = useState<string[]>(event.imageUrls);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Event name is required');
      return;
    }

    if (!eventDate || !eventTime) {
      toast.error('Event date and time are required');
      return;
    }

    if (!isOnline && !location.trim()) {
      toast.error('Location is required for in-person events');
      return;
    }

    if (isOnline && !link.trim()) {
      toast.error('Event link is required for online events');
      return;
    }

    if (limitParticipants && parseInt(limitParticipants) < 1) {
      toast.error('Participant limit must be at least 1');
      return;
    }

    if (limitParticipants && parseInt(limitParticipants) < event.participantCount) {
      toast.error(
        `Participant limit cannot be less than current participant count (${event.participantCount})`,
      );
      return;
    }

    const dateTime = new Date(`${eventDate}T${eventTime}`);
    if (isNaN(dateTime.getTime())) {
      toast.error('Invalid date or time');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    updateMutation.mutate(
      {
        eventId,
        payload: {
          name: name.trim(),
          isOnline,
          eventDate: dateTime.toISOString(),
          location: isOnline ? undefined : location.trim(),
          link: isOnline ? link.trim() : undefined,
          description: description.trim() || undefined,
          tags: tagArray.length > 0 ? tagArray : undefined,
          limitParticipants: limitParticipants ? parseInt(limitParticipants) : undefined,
          imageUrls,
        },
      },
      {
        onSuccess: () => {
          navigate(`/app/events/${eventId}`);
        },
      },
    );
  };

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
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Edit Event</h1>
        <p className="text-muted-foreground">Update your event details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Performance Workshop"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Event Type *</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isOnline}
                  onChange={() => setIsOnline(true)}
                  className="w-4 h-4"
                />
                <span>Online</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isOnline}
                  onChange={() => setIsOnline(false)}
                  className="w-4 h-4"
                />
                <span>In-person</span>
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime">Time *</Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                required
              />
            </div>
          </div>

          {isOnline ? (
            <div className="space-y-2">
              <Label htmlFor="link">Event Link *</Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Conference Room A, Building 1"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="limitParticipants">Participant Limit (optional)</Label>
            <Input
              id="limitParticipants"
              type="number"
              min={event.participantCount}
              value={limitParticipants}
              onChange={(e) => setLimitParticipants(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Current participants: {event.participantCount}. Limit must be greater than or equal to
              current participant count.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <WysiwygEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe your event..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. React, Performance, Workshop (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">
              Add tags separated by commas to help people find your event
            </p>
          </div>

          <div className="space-y-2">
            <Label>Event Images (optional)</Label>
            <MultiImageUpload
              eventId={eventId}
              images={imageUrls}
              onChange={setImageUrls}
              maxImages={5}
            />
            <p className="text-xs text-muted-foreground">
              Upload up to 5 images. The first image will be used as the featured image.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateMutation.isPending} className="min-w-32">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Link to={`/app/events/${eventId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
