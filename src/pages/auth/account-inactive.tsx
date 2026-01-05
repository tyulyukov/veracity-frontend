import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ShieldOff, LogOut, Mail } from 'lucide-react';

export function AccountInactivePage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (user?.status === 'active') {
      navigate('/app', { replace: true });
    } else if (user?.status === 'pending') {
      navigate('/pending-approval', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-8">
          <ShieldOff className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="font-display text-4xl font-bold text-foreground mb-4">
          Account Deactivated
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          Your Veracity account has been deactivated. If you believe this was a mistake 
          or would like to appeal this decision, please contact our support team.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5" />
            <span className="text-sm">support@veracity.com</span>
          </div>
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

