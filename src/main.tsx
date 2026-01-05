import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { router } from './routes/router';
import { ApiClientError } from './api/client';
import './index.css';

function handleUnauthorized(error: Error, queryKey?: readonly unknown[]) {
  if (error instanceof ApiClientError && error.statusCode === 401) {
    if (queryKey?.[0] === 'currentUser') {
      return;
    }
    queryClient.clear();
    window.location.href = '/login';
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => handleUnauthorized(error, query.queryKey),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleUnauthorized(error),
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.statusCode === 401) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
