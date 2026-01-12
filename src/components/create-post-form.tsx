import { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCreatePost, useUpdatePost } from '@/hooks/use-posts';
import { useAuthStore } from '@/stores/auth.store';
import { uploadFile } from '@/api/storage.api';
import { getFullStorageUrl } from '@/lib/storage';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function CreatePostForm() {
  const { user } = useAuthStore();
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && selectedFiles.length === 0) {
      toast.error('Post must have text or images');
      return;
    }

    try {
      const createdPost = await createMutation.mutateAsync({
        text: text.trim() || undefined,
        imageUrls: [],
      });

      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const uploadPromises = selectedFiles.map((file) =>
          uploadFile(file, 'posts', createdPost.id, 'post_image'),
        );
        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map((r) => r.path);

        await updateMutation.mutateAsync({
          postId: createdPost.id,
          payload: {
            text: text.trim() || undefined,
            imageUrls,
          },
        });
      }

      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setText('');
      setSelectedFiles([]);
      setImagePreviews([]);
    } catch {
      toast.error('Failed to create post');
    } finally {
      setUploadingImages(false);
    }
  };

  const isDisabled = createMutation.isPending || uploadingImages || updateMutation.isPending;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3">
        <Avatar
          src={getFullStorageUrl(user.avatarUrl)}
          firstName={user.firstName}
          lastName={user.lastName}
          seed={user.id}
          size="md"
        />

        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isDisabled}
          />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={preview} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    disabled={isDisabled}
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
                id="post-image-upload"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isDisabled || selectedFiles.length >= 4}
              />
              <label htmlFor="post-image-upload">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDisabled || selectedFiles.length >= 4}
                  asChild
                  className="cursor-pointer"
                >
                  <span>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Images ({selectedFiles.length}/4)
                  </span>
                </Button>
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={isDisabled || (!text.trim() && selectedFiles.length === 0)}>
              {isDisabled ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingImages ? 'Uploading...' : 'Posting...'}
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
