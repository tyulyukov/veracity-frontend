import { API_BASE_URL } from './client';
import type { StorageEntity, StorageField, UploadFileResponse } from '@/types';

export async function uploadFile(
  file: File,
  entity: StorageEntity,
  entityId: string,
  field: StorageField,
  onProgress?: (progress: number) => void,
): Promise<UploadFileResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity', entity);
    formData.append('entityId', entityId);
    formData.append('field', field);

    xhr.open('POST', `${API_BASE_URL}/storage/upload`);
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
