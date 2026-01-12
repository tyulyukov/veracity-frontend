import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postsApi } from '@/api/posts.api';
import type {
  CreatePostPayload,
  UpdatePostPayload,
  Post,
  PaginatedPostsResponse,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/types';

export function usePostFeed() {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: ({ pageParam }) =>
      postsApi.getPostFeed({
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useMyPosts() {
  return useInfiniteQuery({
    queryKey: ['posts', 'my'],
    queryFn: ({ pageParam }) =>
      postsApi.getMyPosts({
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: ({ pageParam }) =>
      postsApi.getUserPosts(userId, {
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['posts', postId],
    queryFn: () => postsApi.getPostById(postId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsApi.createPost(payload),
    onSuccess: () => {
      toast.success('Post created successfully');
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to create post';
      toast.error(errorMessage);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: UpdatePostPayload }) =>
      postsApi.updatePost(postId, payload),
    onSuccess: (_, { postId }) => {
      toast.success('Post updated successfully');
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to update post';
      toast.error(errorMessage);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'my'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to delete post';
      toast.error(errorMessage);
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.likePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });
      await queryClient.cancelQueries({ queryKey: ['posts', 'user'], exact: false });

      const previousFeed = queryClient.getQueryData<{ pages: PaginatedPostsResponse[] }>([
        'posts',
        'feed',
      ]);
      const previousPost = queryClient.getQueryData<Post>(['posts', postId]);
      const previousUserPosts = new Map<string, { pages: PaginatedPostsResponse[] }>();

      queryClient.getQueriesData<{ pages: PaginatedPostsResponse[] }>({ queryKey: ['posts', 'user'] }).forEach(([key, data]) => {
        if (data) {
          previousUserPosts.set(JSON.stringify(key), data);
        }
      });

      queryClient.setQueryData<{ pages: PaginatedPostsResponse[] }>(['posts', 'feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { ...post, isLikedByCurrentUser: true, likeCount: post.likeCount + 1 }
                : post,
            ),
          })),
        };
      });

      queryClient.setQueryData<Post>(['posts', postId], (old) => {
        if (!old) return old;
        return { ...old, isLikedByCurrentUser: true, likeCount: old.likeCount + 1 };
      });

      queryClient.setQueriesData<{ pages: PaginatedPostsResponse[] }>({ queryKey: ['posts', 'user'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { ...post, isLikedByCurrentUser: true, likeCount: post.likeCount + 1 }
                : post,
            ),
          })),
        };
      });

      return { previousFeed, previousPost, previousUserPosts };
    },
    onError: (error, postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
      if (context?.previousUserPosts) {
        context.previousUserPosts.forEach((data, key) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to like post';
      toast.error(errorMessage);
    },
  });
}

export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });
      await queryClient.cancelQueries({ queryKey: ['posts', postId] });
      await queryClient.cancelQueries({ queryKey: ['posts', 'user'], exact: false });

      const previousFeed = queryClient.getQueryData<{ pages: PaginatedPostsResponse[] }>([
        'posts',
        'feed',
      ]);
      const previousPost = queryClient.getQueryData<Post>(['posts', postId]);
      const previousUserPosts = new Map<string, { pages: PaginatedPostsResponse[] }>();

      queryClient.getQueriesData<{ pages: PaginatedPostsResponse[] }>({ queryKey: ['posts', 'user'] }).forEach(([key, data]) => {
        if (data) {
          previousUserPosts.set(JSON.stringify(key), data);
        }
      });

      queryClient.setQueryData<{ pages: PaginatedPostsResponse[] }>(['posts', 'feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { ...post, isLikedByCurrentUser: false, likeCount: post.likeCount - 1 }
                : post,
            ),
          })),
        };
      });

      queryClient.setQueryData<Post>(['posts', postId], (old) => {
        if (!old) return old;
        return { ...old, isLikedByCurrentUser: false, likeCount: old.likeCount - 1 };
      });

      queryClient.setQueriesData<{ pages: PaginatedPostsResponse[] }>({ queryKey: ['posts', 'user'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post) =>
              post.id === postId
                ? { ...post, isLikedByCurrentUser: false, likeCount: post.likeCount - 1 }
                : post,
            ),
          })),
        };
      });

      return { previousFeed, previousPost, previousUserPosts };
    },
    onError: (error, postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['posts', postId], context.previousPost);
      }
      if (context?.previousUserPosts) {
        context.previousUserPosts.forEach((data, key) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to unlike post';
      toast.error(errorMessage);
    },
  });
}

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) =>
      postsApi.getComments(postId, {
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: CreateCommentPayload }) =>
      postsApi.createComment(postId, payload),
    onSuccess: (_, { postId }) => {
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to add comment';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      payload,
    }: {
      postId: string;
      commentId: string;
      payload: UpdateCommentPayload;
    }) => postsApi.updateComment(postId, commentId, payload),
    onSuccess: (_, { postId }) => {
      toast.success('Comment updated');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to update comment';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      postsApi.deleteComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error && 'message' in error ? error.message : 'Failed to delete comment';
      toast.error(errorMessage);
    },
  });
}
