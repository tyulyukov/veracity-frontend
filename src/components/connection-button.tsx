import { Check, Clock, Loader2, UserMinus, UserPlus, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSendConnectionRequest, useDeleteConnectionRequest, useRespondToConnection, useDeleteConnection } from '@/hooks/use-connections';

interface ConnectionButtonProps {
  userId: string;
  isConnected: boolean;
  hasOutgoingRequest: boolean;
  hasIncomingRequest: boolean;
  className?: string;
}

export function ConnectionButton({
  userId,
  isConnected,
  hasOutgoingRequest,
  hasIncomingRequest,
  className,
}: ConnectionButtonProps) {
  const sendRequest = useSendConnectionRequest();
  const deleteRequest = useDeleteConnectionRequest();
  const deleteConnection = useDeleteConnection();
  const respondToRequest = useRespondToConnection();

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={() => deleteConnection.mutate(userId)}
        disabled={deleteConnection.isPending}
        className={cn('bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40', className)}
      >
        {deleteConnection.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UserX className="w-4 h-4 mr-2" />
        )}
        Disconnect
      </Button>
    );
  }

  if (hasIncomingRequest) {
    const approving = respondToRequest.variables?.response === 'approved' && respondToRequest.isPending;
    const ignoring = respondToRequest.variables?.response === 'ignored' && respondToRequest.isPending;

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          onClick={() => respondToRequest.mutate({ requesterId: userId, response: 'approved' })}
          disabled={respondToRequest.isPending}
        >
          {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
          Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => respondToRequest.mutate({ requesterId: userId, response: 'ignored' })}
          disabled={respondToRequest.isPending}
        >
          {ignoring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserMinus className="w-4 h-4 mr-2" />}
          Ignore
        </Button>
      </div>
    );
  }

  if (hasOutgoingRequest) {
    return (
      <Button
        variant="outline"
        onClick={() => deleteRequest.mutate(userId)}
        disabled={deleteRequest.isPending}
        className={cn('bg-amber-500/10 text-amber-400 border-amber-500/40', className)}
      >
        {deleteRequest.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Clock className="w-4 h-4 mr-2" />
        )}
        Pending
      </Button>
    );
  }

  return (
    <Button onClick={() => sendRequest.mutate(userId)} disabled={sendRequest.isPending} className={className}>
      {sendRequest.isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      Connect
    </Button>
  );
}

