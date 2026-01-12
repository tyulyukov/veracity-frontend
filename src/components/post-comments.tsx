import { useState } from 'react';
import { Link } from 'react-router';
import { Loader2, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/use-posts';
import { useAuthStore } from '@/stores/auth.store';
import { getFullStorageUrl } from '@/lib/storage';
import type { Comment } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { user } = useAuthStore();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(postId);
  const createMutation = useCreateComment();
  const [newComment, setNewComment] = useState('');

  const allComments = data?.pages.flatMap((page) => page.comments) ?? [];

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    createMutation.mutate(
      { postId, payload: { text: newComment.trim() } },
      {
        onSuccess: () => {
          setNewComment('');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Avatar
              src={getFullStorageUrl(user.avatarUrl)}
              firstName={user.firstName}
              lastName={user.lastName}
              seed={user.id}
              size="sm"
            />
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={createMutation.isPending}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !newComment.trim()}
                  size="sm"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Comment'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>

      {allComments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            size="sm"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more comments'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

function CommentItem({ comment, postId }: CommentItemProps) {
  const { user } = useAuthStore();
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isOwner = user?.id === comment.author.id;
  const createdAt = new Date(comment.createdAt);
  const timeAgo = getTimeAgo(createdAt);

  const handleUpdate = () => {
    if (!editText.trim()) return;

    updateMutation.mutate(
      {
        postId,
        commentId: comment.id,
        payload: { text: editText.trim() },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { postId, commentId: comment.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Link to={`/app/members/${comment.author.id}`}>
            <Avatar
              src={getFullStorageUrl(comment.author.avatarUrl)}
              firstName={comment.author.firstName}
              lastName={comment.author.lastName}
              seed={comment.author.id}
              size="sm"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/app/members/${comment.author.id}`}
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                >
                  {comment.author.firstName} {comment.author.lastName}
                </Link>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>

              {isOwner && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                  disabled={updateMutation.isPending}
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} disabled={updateMutation.isPending} size="sm">
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.text);
                    }}
                    disabled={updateMutation.isPending}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                {comment.text}
              </p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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
