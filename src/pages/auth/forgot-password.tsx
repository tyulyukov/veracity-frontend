import { useState } from 'react';
import { Link } from 'react-router';
import { useForgotPassword } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError } from '@/api/client';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email);
  };

  const errorMessage =
    forgotPassword.error instanceof ApiClientError
      ? forgotPassword.error.message
      : forgotPassword.error?.message;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {forgotPassword.isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Check your email
            </h2>
            <p className="text-muted-foreground mb-8">
              If an account exists for <span className="text-foreground">{email}</span>, we've
              sent a password reset code.
            </p>
            <Link to="/reset-password">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Enter reset code
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Forgot password?
              </h2>
              <p className="text-muted-foreground">
                Enter your email and we'll send you a reset code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={forgotPassword.isPending}
              >
                {forgotPassword.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset code'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

