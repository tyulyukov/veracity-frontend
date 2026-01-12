import { Link } from 'react-router';
import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Post } from '@/types';
import { getFullStorageUrl } from '@/lib/storage';
import { useLikePost, useUnlikePost, useDeletePost } from '@/hooks/use-posts';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImageGallery } from '@/components/image-gallery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onEdit?: () => void;
  showComments?: boolean;
}

export function PostCard({ post, onEdit, showComments = true }: PostCardProps) {
  const { user } = useAuthStore();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const deleteMutation = useDeletePost();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const isOwner = user?.id === post.author.id;
  const createdAt = new Date(post.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  const handleImageClick = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const galleryImages = post.imageUrls.map((url) => getFullStorageUrl(url) || '');

  const handleLike = () => {
    if (post.isLikedByCurrentUser) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <Link
            to={`/app/members/${post.author.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar
              src={getFullStorageUrl(post.author.avatarUrl)}
              firstName={post.author.firstName}
              lastName={post.author.lastName}
              seed={post.author.id}
              size="md"
            />
            <div>
              <p className="font-semibold text-foreground">
                {post.author.firstName} {post.author.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </Link>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

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
                onClick={() => handleImageClick(index)}
                className={cn(
                  'relative rounded-lg overflow-hidden bg-muted cursor-pointer group',
                  post.imageUrls.length === 3 && index === 0 && 'col-span-2',
                  post.imageUrls.length === 1 && 'aspect-video',
                  post.imageUrls.length > 1 && 'aspect-square',
                )}
              >
                <img
                  src={getFullStorageUrl(imageUrl) || ''}
                  alt=""
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors cursor-pointer',
              post.isLikedByCurrentUser
                ? 'text-destructive hover:text-destructive/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
          >
            <Heart
              className={cn('w-5 h-5', post.isLikedByCurrentUser && 'fill-current')}
            />
            <span>{post.likeCount}</span>
          </button>

          {showComments && (
            <Link
              to={`/app/posts/${post.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </Link>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </>
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
