import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  Post,
  CreatePostPayload,
  UpdatePostPayload,
  PostsQueryParams,
  PaginatedPostsResponse,
  PaginatedMyPostsResponse,
  PaginatedCommentsResponse,
  CreateCommentPayload,
  UpdateCommentPayload,
  Comment,
} from '@/types';

export async function getPostFeed(params?: PostsQueryParams): Promise<PaginatedPostsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedPostsResponse>(`/posts/feed${query ? `?${query}` : ''}`);
}

export async function getMyPosts(params?: PostsQueryParams): Promise<PaginatedMyPostsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedMyPostsResponse>(`/posts/my${query ? `?${query}` : ''}`);
}

export async function getPostById(postId: string): Promise<Post> {
  return apiGet<Post>(`/posts/${postId}`);
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  return apiPost<Post, CreatePostPayload>('/posts', payload);
}

export async function updatePost(postId: string, payload: UpdatePostPayload): Promise<Post> {
  return apiPatch<Post, UpdatePostPayload>(`/posts/${postId}`, payload);
}

export async function deletePost(postId: string): Promise<void> {
  return apiDelete<void>(`/posts/${postId}`);
}

export async function likePost(postId: string): Promise<void> {
  return apiPost<void, undefined>(`/posts/${postId}/like`, undefined);
}

export async function unlikePost(postId: string): Promise<void> {
  return apiDelete<void>(`/posts/${postId}/like`);
}

export async function getComments(
  postId: string,
  params?: PostsQueryParams,
): Promise<PaginatedCommentsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  return apiGet<PaginatedCommentsResponse>(
    `/posts/${postId}/comments${query ? `?${query}` : ''}`,
  );
}

export async function createComment(
  postId: string,
  payload: CreateCommentPayload,
): Promise<Comment> {
  return apiPost<Comment, CreateCommentPayload>(`/posts/${postId}/comments`, payload);
}

export async function updateComment(
  postId: string,
  commentId: string,
  payload: UpdateCommentPayload,
): Promise<Comment> {
  return apiPatch<Comment, UpdateCommentPayload>(
    `/posts/${postId}/comments/${commentId}`,
    payload,
  );
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  return apiDelete<void>(`/posts/${postId}/comments/${commentId}`);
}

export const postsApi = {
  getPostFeed,
  getMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
