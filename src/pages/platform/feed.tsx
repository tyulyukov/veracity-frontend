import { useEffect, useRef } from 'react';
import { Loader2, Rss } from 'lucide-react';
import { usePostFeed } from '@/hooks/use-posts';
import { CreatePostForm } from '@/components/create-post-form';
import { PostCard } from '@/components/post-card';

export function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostFeed();
  const observerTarget = useRef<HTMLDivElement>(null);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Feed</h1>
        <p className="text-muted-foreground">Posts from your connections</p>
      </div>

      <div className="space-y-6">
        <CreatePostForm />

        {allPosts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Rss className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Posts from your connections will appear here. Connect with members to see their posts!
            </p>
          </div>
        ) : (
          <>
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            <div ref={observerTarget} className="py-4">
              {isFetchingNextPage && (
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>

            {!hasNextPage && allPosts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                You've reached the end
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

