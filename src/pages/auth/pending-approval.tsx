import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/api/users.api';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, CheckCircle } from 'lucide-react';

export function PendingApprovalPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const { setUser } = useAuthStore();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (user?.status === 'active') {
      setUser(user);
      queryClient.setQueryData(['currentUser'], user);
      navigate('/app', { replace: true });
    }
  }, [user, navigate, setUser, queryClient]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Clock className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-4">
          Application Under Review
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          Thank you for applying to Veracity. Our team is reviewing your application to ensure 
          you're a great fit for our community of business leaders.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Our team reviews your profile and background</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>You'll receive an email once approved</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>This page will automatically update when you're approved</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Checking status every 5 seconds...</span>
        </div>

        <Button
          variant="outline"
          onClick={() => logout.mutate()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
