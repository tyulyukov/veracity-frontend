import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreateEvent } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { WysiwygEditor } from '@/components/wysiwyg-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [limitParticipants, setLimitParticipants] = useState('');

  const createMutation = useCreateEvent();

  useEffect(() => {
    if (user && user.role !== 'speaker') {
      toast.error('Only speakers can create events');
      navigate('/app/events');
    }
  }, [user, navigate]);

  if (user?.role !== 'speaker') {
    return null;
  }

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

    const dateTime = new Date(`${eventDate}T${eventTime}`);
    if (isNaN(dateTime.getTime())) {
      toast.error('Invalid date or time');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    createMutation.mutate(
      {
        name: name.trim(),
        isOnline,
        eventDate: dateTime.toISOString(),
        location: isOnline ? undefined : location.trim(),
        link: isOnline ? link.trim() : undefined,
        description: description.trim() || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        limitParticipants: limitParticipants ? parseInt(limitParticipants) : undefined,
        imageUrls: [],
      },
      {
        onSuccess: (data) => {
          navigate(`/app/my-events/${data.id}/add-images`, { state: { newEvent: true } });
        },
      },
    );
  };

  const isSubmitting = createMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/app/my-events"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to my events
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Event</h1>
        <p className="text-muted-foreground">Fill in the details to create a new event</p>
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
              min="1"
              value={limitParticipants}
              onChange={(e) => setLimitParticipants(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of participants. Leave empty for unlimited registrations.
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
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Continue to Add Images'
            )}
          </Button>
          <Link to="/app/events">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Next step: You'll be able to add up to 5 images to your event
        </p>
      </form>
    </div>
  );
}
