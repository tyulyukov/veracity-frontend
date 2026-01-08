import { Link } from 'react-router';
import { Calendar, MapPin, Globe, Users, Edit, Trash2, UserCheck } from 'lucide-react';
import type { EventListItem } from '@/types';
import { getFullStorageUrl } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface EventCardProps {
  event: EventListItem;
  variant?: 'default' | 'owned';
  onEdit?: () => void;
  onDelete?: () => void;
  onViewParticipants?: () => void;
}

export function EventCard({
  event,
  variant = 'default',
  onEdit,
  onDelete,
  onViewParticipants,
}: EventCardProps) {
  const featuredImage = event.imageUrls[0];
  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();
  const isFull =
    event.limitParticipants !== null && event.participantCount >= event.limitParticipants;

  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <Link to={`/app/events/${event.id}`}>
        {featuredImage ? (
          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 relative">
            <img
              src={getFullStorageUrl(featuredImage) || ''}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            {!isUpcoming && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-muted/90 text-muted-foreground text-xs rounded">
                Past Event
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary/40" />
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/app/events/${event.id}`}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
            {event.name}
          </h3>
        </Link>

        {event.speaker && (
          <div className="flex items-center gap-2 mb-3">
            <Link
              to={`/app/members/${event.speaker.id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={getFullStorageUrl(event.speaker.avatarUrl)}
                firstName={event.speaker.firstName}
                lastName={event.speaker.lastName}
                seed={event.speaker.id}
                size="sm"
              />
              <span className="text-sm text-muted-foreground">
                {event.speaker.firstName} {event.speaker.lastName}
              </span>
            </Link>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {event.isOnline ? (
              <>
                <Globe className="w-4 h-4" />
                <span>Online Event</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.location || 'Location TBA'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {event.participantCount}
              {event.limitParticipants !== null && ` / ${event.limitParticipants}`} participant
              {event.participantCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {variant === 'default' && (
          <div className="flex items-center gap-2">
            {event.isRegistered === true && (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                Registered
              </Badge>
            )}
            {isFull && event.isRegistered !== true && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400">
                Full
              </Badge>
            )}
          </div>
        )}

        {variant === 'owned' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onEdit?.();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/20 hover:bg-muted/30 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onViewParticipants?.();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted/20 hover:bg-muted/30 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{event.participantCount}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete?.();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
