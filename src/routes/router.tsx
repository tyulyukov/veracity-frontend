import { createBrowserRouter } from 'react-router';
import { ProtectedRoute, ActiveUserRoute, PublicOnlyRoute } from './protected-route';
import { PlatformLayout } from '@/layouts/platform-layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
import { PendingApprovalPage } from '@/pages/auth/pending-approval';
import { AccountInactivePage } from '@/pages/auth/account-inactive';
import { FeedPage } from '@/pages/platform/feed';
import { MyPostsPage } from '@/pages/platform/my-posts';
import { PostDetailPage } from '@/pages/platform/post-detail';
import { MembersPage } from '@/pages/platform/members';
import { MemberProfilePage } from '@/pages/platform/member-profile';
import { ProfilePage } from '@/pages/platform/profile';
import { EditProfilePage } from '@/pages/platform/edit-profile';
import { ConnectionsPage } from '@/pages/platform/connections';
import { EventsPage } from '@/pages/platform/events';
import { EventDetailPage } from '@/pages/platform/event-detail';
import { CreateEventPage } from '@/pages/platform/create-event';
import { AddEventImagesPage } from '@/pages/platform/add-event-images';
import { EditEventPage } from '@/pages/platform/edit-event';
import { EventParticipantsPage } from '@/pages/platform/event-participants';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    element: <PublicOnlyRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'pending-approval',
        element: <PendingApprovalPage />,
      },
      {
        path: 'account-inactive',
        element: <AccountInactivePage />,
      },
    ],
  },
  {
    path: 'app',
    element: <ActiveUserRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <PlatformLayout />,
        children: [
          {
            index: true,
            element: <FeedPage />,
          },
          {
            path: 'feed',
            element: <FeedPage />,
          },
          {
            path: 'posts/:postId',
            element: <PostDetailPage />,
          },
          {
            path: 'my-posts',
            element: <MyPostsPage />,
          },
          {
            path: 'members',
            element: <MembersPage />,
          },
          {
            path: 'members/:memberId',
            element: <MemberProfilePage />,
          },
          {
            path: 'members/:memberId/connections',
            element: <ConnectionsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'profile/edit',
            element: <EditProfilePage />,
          },
          {
            path: 'profile/connections',
            element: <ConnectionsPage />,
          },
          {
            path: 'events',
            element: <EventsPage />,
          },
          {
            path: 'events/:eventId',
            element: <EventDetailPage />,
          },
          {
            path: 'my-events/create',
            element: <CreateEventPage />,
          },
          {
            path: 'my-events/:eventId/add-images',
            element: <AddEventImagesPage />,
          },
          {
            path: 'my-events/:eventId/edit',
            element: <EditEventPage />,
          },
          {
            path: 'my-events/:eventId/participants',
            element: <EventParticipantsPage />,
          },
        ],
      },
    ],
  },
]);

