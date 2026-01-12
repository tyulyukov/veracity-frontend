import { useEffect, useRef, useState } from 'react';
import { Loader2, FileText, Edit } from 'lucide-react';
import { useMyPosts, useUpdatePost } from '@/hooks/use-posts';
import { CreatePostForm } from '@/components/create-post-form';
import { getFullStorageUrl } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth.store';
import type { MyPost, UpdatePostPayload } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, X, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/api/storage.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MyPostsPage() {
  const { user } = useAuthStore();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyPosts();
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
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">My Posts</h1>
        <p className="text-muted-foreground">Manage your posts</p>
      </div>

      <div className="space-y-6">
        <CreatePostForm />

        {allPosts.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Create your first post to share with your connections!
            </p>
          </div>
        ) : (
          <>
            {allPosts.map((post) => (
              <MyPostCard key={post.id} post={post} user={user!} />
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

interface MyPostCardProps {
  post: MyPost;
  user: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
}

function MyPostCard({ post, user }: MyPostCardProps) {
  const updateMutation = useUpdatePost();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editImages, setEditImages] = useState(post.imageUrls);
  const [uploadingImages, setUploadingImages] = useState(false);

  const createdAt = new Date(post.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (editImages.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadPromises = files.map((file) => uploadFile(file, 'posts', post.id, 'post_image'));
      const results = await Promise.all(uploadPromises);
      setEditImages((prev) => [...prev, ...results.map((r) => r.path)]);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    if (!editText.trim() && editImages.length === 0) {
      toast.error('Post must have text or images');
      return;
    }

    const payload: UpdatePostPayload = {
      text: editText.trim() || undefined,
      imageUrls: editImages.length > 0 ? editImages : undefined,
    };

    updateMutation.mutate(
      { postId: post.id, payload },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(post.text);
    setEditImages(post.imageUrls);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={getFullStorageUrl(user.avatarUrl)}
            firstName={user.firstName}
            lastName={user.lastName}
            seed={user.id}
            size="md"
          />
          <div>
            <p className="font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={updateMutation.isPending || uploadingImages}
          />

          {editImages.length > 0 && (
            <div
              className={cn(
                'grid gap-2',
                editImages.length === 1 && 'grid-cols-1',
                editImages.length === 2 && 'grid-cols-2',
                editImages.length >= 3 && 'grid-cols-2',
              )}
            >
              {editImages.map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className={cn(
                    'relative rounded-lg overflow-hidden bg-muted group',
                    editImages.length === 3 && index === 0 && 'col-span-2',
                    editImages.length === 1 && 'aspect-video',
                    editImages.length > 1 && 'aspect-square',
                  )}
                >
                  <img
                    src={getFullStorageUrl(imageUrl) || ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    disabled={updateMutation.isPending || uploadingImages}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="relative">
              <input
                type="file"
                id={`edit-image-upload-${post.id}`}
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={updateMutation.isPending || uploadingImages || editImages.length >= 4}
              />
              <label htmlFor={`edit-image-upload-${post.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updateMutation.isPending || uploadingImages || editImages.length >= 4}
                  asChild
                  className="cursor-pointer"
                >
                  <span>
                    {uploadingImages ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Add Images ({editImages.length}/4)
                  </span>
                </Button>
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || uploadingImages || (!editText.trim() && editImages.length === 0)}
                size="sm"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending || uploadingImages}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {post.text && (
            <p className="text-foreground mb-4 whitespace-pre-wrap break-words">{post.text}</p>
          )}

          {post.imageUrls.length > 0 && (
            <div
              className={cn(
                'grid gap-2 mb-4',
                post.imageUrls.length === 1 && 'grid-cols-1',
                post.imageUrls.length === 2 && 'grid-cols-2',
                post.imageUrls.length >= 3 && 'grid-cols-2',
              )}
            >
              {post.imageUrls.map((imageUrl, index) => (
                <div
                  key={imageUrl}
                  className={cn(
                    'relative rounded-lg overflow-hidden bg-muted',
                    post.imageUrls.length === 3 && index === 0 && 'col-span-2',
                    post.imageUrls.length === 1 && 'aspect-video',
                    post.imageUrls.length > 1 && 'aspect-square',
                  )}
                >
                  <img
                    src={getFullStorageUrl(imageUrl) || ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-5 h-5" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
