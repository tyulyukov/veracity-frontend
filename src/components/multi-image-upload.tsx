import { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { uploadFile } from '@/api/storage.api';
import { getFullStorageUrl } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MultiImageUploadProps {
  eventId: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface UploadingImage {
  id: string;
  preview: string;
  progress: number;
}

export function MultiImageUpload({
  eventId,
  images,
  onChange,
  maxImages = 5,
  className,
}: MultiImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImagesRef = useRef<string[]>(images);

  useEffect(() => {
    currentImagesRef.current = images;
  }, [images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxImages - images.length - uploadingImages.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        continue;
      }

      const uploadId = Math.random().toString(36).substring(7);
      const preview = URL.createObjectURL(file);

      setUploadingImages((prev) => [...prev, { id: uploadId, preview, progress: 0 }]);

      try {
        const { path } = await uploadFile(file, 'events', eventId, 'event_image', (progress) => {
          setUploadingImages((prev) =>
            prev.map((img) => (img.id === uploadId ? { ...img, progress } : img)),
          );
        });

        setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));

        const newImages = [...currentImagesRef.current, path];
        onChange(newImages);
        URL.revokeObjectURL(preview);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));
        URL.revokeObjectURL(preview);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = images.length + uploadingImages.length < maxImages;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          Images ({images.length + uploadingImages.length}/{maxImages})
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imagePath, index) => (
          <div key={imagePath} className="relative aspect-video group">
            <img
              src={getFullStorageUrl(imagePath) || ''}
              alt={`Event image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 bg-destructive/90 hover:bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded">
                Featured
              </div>
            )}
          </div>
        ))}

        {uploadingImages.map((uploadingImage) => (
          <div key={uploadingImage.id} className="relative aspect-video">
            <img
              src={uploadingImage.preview}
              alt="Uploading"
              className="w-full h-full object-cover rounded-lg border border-border opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-white font-medium">{uploadingImage.progress}%</p>
              </div>
            </div>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'aspect-video border-2 border-dashed border-border rounded-lg',
              'flex flex-col items-center justify-center gap-2',
              'hover:border-primary/50 hover:bg-primary/5 transition-colors',
              'text-muted-foreground hover:text-foreground',
            )}
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">Add Image</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
