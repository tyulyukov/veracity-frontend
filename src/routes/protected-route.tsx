import { Navigate, Outlet } from 'react-router';
import { useCurrentUser } from '@/hooks/use-auth';

export function ProtectedRoute() {
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function ActiveUserRoute() {
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (user.status === 'inactive') {
    return <Navigate to="/account-inactive" replace />;
  }

  if (user.status !== 'active') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isError && user) {
    if (user.status === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (user.status === 'inactive') {
      return <Navigate to="/account-inactive" replace />;
    }
    if (user.status === 'active') {
      return <Navigate to="/app" replace />;
    }
  }

  return <Outlet />;
}
