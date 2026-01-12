import { useParams, Link } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { usePost } from '@/hooks/use-posts';
import { PostCard } from '@/components/post-card';
import { PostComments } from '@/components/post-comments';
import { Button } from '@/components/ui/button';

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { data: post, isLoading, isError } = usePost(postId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h3 className="font-semibold text-foreground mb-2">Post not found</h3>
          <p className="text-muted-foreground mb-4">
            The post you are looking for does not exist or has been removed
          </p>
          <Link to="/app/feed">
            <Button variant="outline">Back to Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/app/feed"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      <div className="space-y-6">
        <PostCard post={post} showComments={false} />

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Comments</h2>
          <PostComments postId={postId!} />
        </div>
      </div>
    </div>
  );
}
