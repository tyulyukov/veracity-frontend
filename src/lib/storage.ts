import { STORAGE_BASE_URL } from '@/types';

export function getFullStorageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

