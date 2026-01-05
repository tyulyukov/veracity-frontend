import { useAuthStore } from '@/stores/auth.store';
import { Sparkles } from 'lucide-react';

export function FeedPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground">
          Stay connected with your network
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
          Feed Coming Soon
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          This is where you'll see updates, posts, and activity from your network. 
          Stay tuned for exciting features!
        </p>
      </div>
    </div>
  );
}

