import { createBrowserRouter } from 'react-router';
import { ProtectedRoute, ActiveUserRoute, PublicOnlyRoute } from './protected-route';
import { PlatformLayout } from '@/layouts/platform-layout';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
import { PendingApprovalPage } from '@/pages/auth/pending-approval';
import { AccountInactivePage } from '@/pages/auth/account-inactive';
import { FeedPage } from '@/pages/platform/feed';
import { MembersPage } from '@/pages/platform/members';
import { MemberProfilePage } from '@/pages/platform/member-profile';
import { ProfilePage } from '@/pages/platform/profile';
import { EditProfilePage } from '@/pages/platform/edit-profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <PublicOnlyRoute />,
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
    children: [
      {
        element: <PlatformLayout />,
        children: [
          {
            index: true,
            element: <FeedPage />,
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
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'profile/edit',
            element: <EditProfilePage />,
          },
        ],
      },
    ],
  },
]);

