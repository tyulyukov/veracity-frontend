import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useRegisterForEvent, useUnregisterFromEvent } from '@/hooks/use-events';

interface EventRegistrationButtonProps {
  eventId: string;
  isRegistered: boolean;
  isFull: boolean;
  className?: string;
}

export function EventRegistrationButton({
  eventId,
  isRegistered,
  isFull,
  className,
}: EventRegistrationButtonProps) {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [unregisterDialogOpen, setUnregisterDialogOpen] = useState(false);
  const [comment, setComment] = useState('');

  const registerMutation = useRegisterForEvent();
  const unregisterMutation = useUnregisterFromEvent();

  const handleRegister = () => {
    registerMutation.mutate(
      { eventId, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRegisterDialogOpen(false);
          setComment('');
        },
      },
    );
  };

  const handleUnregister = () => {
    unregisterMutation.mutate(eventId, {
      onSuccess: () => {
        setUnregisterDialogOpen(false);
      },
    });
  };

  if (isRegistered) {
    return (
      <AlertDialog open={unregisterDialogOpen} onOpenChange={setUnregisterDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className={className}>
            Unregister
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unregister from event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unregister from this event? You can register again later if
              spots are available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleUnregister}
              disabled={unregisterMutation.isPending}
            >
              {unregisterMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unregistering...
                </>
              ) : (
                'Unregister'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const disabled = isFull || registerMutation.isPending;

  return (
    <AlertDialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button className={className} disabled={disabled}>
          {isFull ? 'Event Full' : 'Register'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Register for event</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to add a comment with your registration? This will be visible to the
            event organizer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="comment">Comment (optional)</Label>
          <Textarea
            id="comment"
            placeholder="Why are you interested in this event?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRegister} disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
