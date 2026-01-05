import { apiGet } from './client';
import type { Interest } from '@/types';

export async function getInterests(): Promise<Interest[]> {
  return apiGet<Interest[]>('/interests');
}

