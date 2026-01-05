import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { updateMe } from '@/api/users.api';
import { getInterests } from '@/api/interests.api';
import { getUploadUrl, uploadToPresignedUrl } from '@/api/storage.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/api/client';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UpdateProfilePayload } from '@/types';

export function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    position: '',
    shortDescription: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState<{ key: string; value: string }[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: interests = [] } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || '',
        position: user.position || '',
        shortDescription: user.shortDescription || '',
      });
      setSelectedInterests(user.interests.map((i) => i.id));
      if (user.contactInfo) {
        setContactInfo(
          Object.entries(user.contactInfo).map(([key, value]) => ({ key, value }))
        );
      }
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/app/profile');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addContactField = () => {
    setContactInfo((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateContactField = (index: number, field: 'key' | 'value', value: string) => {
    setContactInfo((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeContactField = (index: number) => {
    setContactInfo((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm((prev) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalAvatarUrl = form.avatarUrl || undefined;

    if (avatarFile && user) {
      try {
        setUploadProgress(0);
        setUploadError(null);

        const { uploadUrl, publicUrl } = await getUploadUrl({
          entity: 'users',
          entityId: user.id,
          field: 'avatar',
          filename: `avatar-${Date.now()}.${avatarFile.name.split('.').pop()}`,
          contentType: avatarFile.type,
        });

        await uploadToPresignedUrl(uploadUrl, avatarFile, setUploadProgress);
        finalAvatarUrl = publicUrl;
        setUploadProgress(null);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
        setUploadProgress(null);
        return;
      }
    }

    const contactInfoObject = contactInfo.reduce(
      (acc, { key, value }) => {
        if (key.trim() && value.trim()) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      },
      {} as Record<string, string>
    );

    updateMutation.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      avatarUrl: finalAvatarUrl,
      position: form.position || undefined,
      shortDescription: form.shortDescription || undefined,
      interestIds: selectedInterests,
      contactInfo: Object.keys(contactInfoObject).length > 0 ? contactInfoObject : undefined,
    });
  };

  const errorMessage =
    updateMutation.error instanceof ApiClientError
      ? updateMutation.error.message
      : updateMutation.error?.message;

  if (isLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/app/profile')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to profile
      </button>

      <div className="bg-card border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Avatar</Label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border border-border"
                    />
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : form.avatarUrl ? (
                  <div className="relative">
                    <Avatar
                      src={form.avatarUrl}
                      firstName={form.firstName || 'U'}
                      lastName={form.lastName || 'U'}
                      seed={user?.id}
                      size="xl"
                      className="border border-border w-24 h-24"
                    />
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted border border-dashed border-border flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose image
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF or WebP. Max 5MB.
                </p>
                {uploadProgress !== null && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {uploadError && (
                  <p className="text-xs text-destructive">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="CEO, Founder, Director..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short bio</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Contact Info</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addContactField}>
                + Add field
              </Button>
            </div>
            {contactInfo.length > 0 && (
              <div className="space-y-2">
                {contactInfo.map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Label (e.g. Telegram)"
                      value={field.key}
                      onChange={(e) => updateContactField(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g. @username)"
                      value={field.value}
                      onChange={(e) => updateContactField(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContactField(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                    selectedInterests.includes(interest.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                  )}
                >
                  {interest.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/app/profile')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={updateMutation.isPending || uploadProgress !== null}
            >
              {uploadProgress !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

