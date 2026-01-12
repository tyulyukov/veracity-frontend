import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterests } from '@/api/interests.api';
import { register as registerApi } from '@/api/auth.api';
import { uploadFile } from '@/api/storage.api';
import { updateMe } from '@/api/users.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarCropModal } from '@/components/avatar-crop-modal';
import { ApiClientError } from '@/api/client';
import { ArrowLeft, Loader2, Check, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegisterPayload } from '@/types';

export function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
    shortDescription: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const register = useMutation({
    mutationFn: async (payload: RegisterPayload & { avatarFile?: File | null }) => {
      const { avatarFile: file, ...registerPayload } = payload;

      const { userId } = await registerApi(registerPayload);

      if (file) {
        setUploadProgress(0);
        const { path } = await uploadFile(file, 'users', userId, 'avatar', setUploadProgress);
        setUploadProgress(null);

        await updateMe({ avatarUrl: path });
      }

      return { userId };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/pending-approval');
    },
    onError: () => {
      setUploadProgress(null);
    },
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'avatar.png', { type: croppedBlob.type });
    setAvatarFile(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    register.mutate({
      ...form,
      interestIds: selectedInterests,
      position: form.position || undefined,
      shortDescription: form.shortDescription || undefined,
      avatarFile,
    });
  };

  const errorMessage =
    register.error instanceof ApiClientError ? register.error.message : register.error?.message;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:flex-1 bg-card border-r border-border items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="font-display text-5xl font-bold text-foreground mb-6 leading-tight">
            Join the <span className="text-primary">Elite</span> Network
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Apply for membership to connect with verified executives, founders, and industry leaders.
          </p>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Vetted community of business leaders</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Exclusive events and roundtables</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span>Meaningful professional connections</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Apply for membership
            </h2>
            <p className="text-muted-foreground">
              Complete your profile to submit your application
            </p>
          </div>

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
                  placeholder="John"
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
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Avatar (optional)</Label>
              <div className="flex items-start gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border border-border"
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
                    <div className="w-20 h-20 rounded-full bg-muted border border-dashed border-border flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position (optional)</Label>
              <Input
                id="position"
                name="position"
                value={form.position}
                onChange={handleChange}
                placeholder="CEO, Founder, Director..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short bio (optional)</Label>
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
              <Label>Interests (select at least one)</Label>
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

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={register.isPending || selectedInterests.length === 0 || uploadProgress !== null}
            >
              {uploadProgress !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading avatar... {uploadProgress}%
                </>
              ) : register.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <AvatarCropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={originalImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

