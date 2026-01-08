import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { useMyEvent, useUpdateEvent } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { MultiImageUpload } from '@/components/multi-image-upload';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AddEventImagesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: event, isLoading, isError } = useMyEvent(eventId!);
  const updateMutation = useUpdateEvent();

  const isNewEvent = location.state?.newEvent;

  useEffect(() => {
    if (user && user.role !== 'speaker') {
      toast.error('Only speakers can edit events');
      navigate('/app/events');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (event && event.imageUrls) {
      setImageUrls(event.imageUrls);
    }
  }, [event]);

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

  if (isError || !event) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h3 className="font-semibold text-foreground mb-2">Event not found</h3>
          <p className="text-muted-foreground mb-4">
            The event you are trying to edit does not exist or you don't have permission to edit it
          </p>
          <Link to="/app/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleFinish = () => {
    if (imageUrls.length === 0) {
      navigate(`/app/events/${eventId}`);
      return;
    }

    updateMutation.mutate(
      {
        eventId: eventId!,
        payload: { imageUrls },
      },
      {
        onSuccess: () => {
          navigate(`/app/events/${eventId}`);
        },
      },
    );
  };

  const handleSkip = () => {
    navigate(`/app/events/${eventId}`);
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

      {isNewEvent && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 rounded-full p-2">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Event created successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Now add images to make your event more attractive (optional)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {isNewEvent ? 'Add Event Images' : 'Manage Event Images'}
        </h1>
        <p className="text-muted-foreground">
          {isNewEvent
            ? 'Upload up to 5 images to showcase your event'
            : 'Update images for your event'}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <MultiImageUpload
          eventId={eventId!}
          images={imageUrls}
          onChange={setImageUrls}
          maxImages={5}
        />
        <p className="text-sm text-muted-foreground mt-4">
          The first image will be used as the featured image in event listings
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleFinish} disabled={updateMutation.isPending} className="min-w-32">
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : imageUrls.length > 0 ? (
            'Save & View Event'
          ) : (
            'Skip & View Event'
          )}
        </Button>
        {isNewEvent && (
          <Button type="button" variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
        )}
        {!isNewEvent && (
          <Link to={`/app/events/${eventId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
