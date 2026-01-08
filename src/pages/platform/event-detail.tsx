import { Link, useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Globe,
  Users,
  Edit,
  Trash2,
  UserCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useEvent, useDeleteEvent } from '@/hooks/use-events';
import { useAuthStore } from '@/stores/auth.store';
import { getFullStorageUrl } from '@/lib/storage';
import { formatRole } from '@/lib/utils';
import { HtmlContent } from '@/components/html-content';
import { EventRegistrationButton } from '@/components/event-registration-button';
import { ImageGallery } from '@/components/image-gallery';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { data, isLoading, isError } = useEvent(eventId!);
  const deleteMutation = useDeleteEvent();

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
            The event you are looking for does not exist or has been removed
          </p>
          <Link to="/app/events">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id && data.speaker ? user.id === data.speaker.id : false;
  const isFull =
    data.limitParticipants !== null && data.participantCount >= data.limitParticipants;
  const eventDate = new Date(data.eventDate);
  const isUpcoming = eventDate > new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleDelete = () => {
    deleteMutation.mutate(eventId!, {
      onSuccess: () => {
        navigate('/app/events');
      },
    });
  };

  const handleImageClick = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const galleryImages = data.imageUrls.map((url) => getFullStorageUrl(url) || '');

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <Link
          to="/app/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </Link>

        {data.imageUrls.length > 0 && (
          <div
            className="w-full aspect-[21/9] rounded-xl overflow-hidden mb-8 cursor-pointer relative group"
            onClick={() => handleImageClick(0)}
          >
            <img
              src={getFullStorageUrl(data.imageUrls[0]) || ''}
              alt={data.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {!isUpcoming && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
                Past Event
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">{data.name}</h1>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {data.speaker && (
              <Link
                to={`/app/members/${data.speaker.id}`}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
              >
                <Avatar
                  src={getFullStorageUrl(data.speaker.avatarUrl)}
                  firstName={data.speaker.firstName}
                  lastName={data.speaker.lastName}
                  seed={data.speaker.id}
                  size="md"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Organized by</p>
                  <p className="font-semibold text-foreground">
                    {data.speaker.firstName} {data.speaker.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRole(data.speaker.role)}</p>
                </div>
              </Link>
            )}

            {data.description && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  About this event
                </h2>
                <HtmlContent html={data.description} />
              </div>
            )}

            {data.imageUrls.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {data.imageUrls.slice(1).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="aspect-video relative cursor-pointer group overflow-hidden rounded-lg"
                      onClick={() => handleImageClick(index + 1)}
                    >
                      <img
                        src={getFullStorageUrl(imageUrl) || ''}
                        alt={`${data.name} image ${index + 2}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Link to={`/app/my-events/${eventId}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                </Link>
                <Link to={`/app/my-events/${eventId}/participants`}>
                  <Button variant="outline">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Participants ({data.participantCount})
                  </Button>
                </Link>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="ml-auto">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                        All participants will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
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
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4 sticky top-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {data.isOnline ? (
                    <>
                      <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Online Event</p>
                        {data.link && (
                          <a
                            href={data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Join event
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {data.location || 'Location TBA'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {data.participantCount} registered
                    </p>
                    {data.limitParticipants !== null && (
                      <p className="text-sm text-muted-foreground">
                        Limit: {data.limitParticipants}
                        {isFull && ' (Full)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!isOwner && (
                <div className="pt-4 border-t border-border">
                  <EventRegistrationButton
                    eventId={data.id}
                    isRegistered={data.isRegistered ?? false}
                    isFull={isFull}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
  );
}
