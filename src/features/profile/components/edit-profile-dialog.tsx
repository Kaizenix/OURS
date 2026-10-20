'use client';

import { useState, useRef } from 'react';
import { Loader2, Heart, User, Image as ImageIcon, Upload, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Profile } from '@/types/database';
import { updateMyProfileAction } from '@/features/profile/actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess?: () => void;
}

const LOVE_LANGUAGES = [
  'Words of Affirmation',
  'Quality Time',
  'Receiving Gifts',
  'Acts of Service',
  'Physical Touch',
];

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [loveLanguage, setLoveLanguage] = useState(profile.love_language || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const url = await uploadFileToStorage(file, 'avatars', 'profiles');
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError('Gagal mengunggah avatar ke storage. Pastikan bucket storage telah dibuat di Supabase.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateMyProfileAction({
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        love_language: loveLanguage || undefined,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md p-6 bg-surface border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Edit Your Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4 py-1">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-card border-2 border-border/60 flex items-center justify-center font-serif text-xl shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{displayName.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFile}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="rounded-xl text-xs gap-1.5 h-9"
              >
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-primary" />}
                <span>Upload from Device</span>
              </Button>
              <p className="text-[11px] text-muted-foreground">Pick from photo library or camera</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="rounded-xl h-11 bg-background/60 text-sm"
              required
            />
          </div>

          {/* Avatar URL Fallback */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-primary" />
              Or Image URL
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... (direct photo link)"
              className="rounded-xl h-9 bg-background/40 text-xs"
            />
          </div>

          {/* Love Language */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary" />
              Primary Love Language
            </label>
            <select
              value={loveLanguage}
              onChange={(e) => setLoveLanguage(e.target.value)}
              className="w-full rounded-xl h-11 bg-background/60 border border-border/40 px-3 text-xs text-foreground focus:outline-hidden focus:border-primary"
            >
              <option value="">Select your love language...</option>
              {LOVE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !displayName.trim()}
              className="rounded-xl px-5 text-xs font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
