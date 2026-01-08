import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorBoundary() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';
  let statusCode: number | undefined;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;

    switch (error.status) {
      case 404:
        title = 'Page not found';
        message = 'The page you are looking for does not exist.';
        break;
      case 403:
        title = 'Access denied';
        message = 'You do not have permission to access this resource.';
        break;
      case 401:
        title = 'Unauthorized';
        message = 'Please log in to access this page.';
        break;
      case 500:
        title = 'Server error';
        message = 'An internal server error occurred. Please try again later.';
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || 'An error occurred';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          {statusCode && (
            <p className="text-sm text-muted-foreground mb-2">Error {statusCode}</p>
          )}

          <h1 className="font-display text-2xl font-bold text-foreground mb-3">{title}</h1>

          <p className="text-muted-foreground mb-8">{message}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
