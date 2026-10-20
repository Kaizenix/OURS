'use client';

import { useState, useRef } from 'react';
import { Loader2, Calendar, Image as ImageIcon, HeartHandshake, Quote, Upload, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Couple } from '@/types/database';
import { updateCoupleStoryAction } from '@/features/profile/actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface EditCoupleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couple: Couple;
  onSuccess?: () => void;
}

export function EditCoupleDialog({
  open,
  onOpenChange,
  couple,
  onSuccess,
}: EditCoupleDialogProps) {
  const [name, setName] = useState(couple.name || '');
  const [startDate, setStartDate] = useState(couple.start_date || '');
  const [coverImageUrl, setCoverImageUrl] = useState(couple.cover_image_url || '');
  const [quote, setQuote] = useState(couple.quote || '');
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const url = await uploadFileToStorage(file, 'photos', 'covers');
      setCoverImageUrl(url);
    } catch {
      setCoverImageUrl(URL.createObjectURL(file));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateCoupleStoryAction({
        name: name.trim() || undefined,
        start_date: startDate || undefined,
        cover_image_url: coverImageUrl.trim() || undefined,
        quote: quote.trim() || undefined,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Edit Couple Space
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Couple Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-primary" />
              Couple Space Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ardan & Nara"
              className="rounded-xl h-11 bg-background/60 text-sm"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Relationship Start Date (Anniversary)
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl h-11 bg-background/60 text-xs"
            />
          </div>

          {/* Cover Photo */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Cover Banner Photo
              </span>
              {uploadingCover && <span className="text-[11px] text-primary animate-pulse">Uploading...</span>}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverFile}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="rounded-xl h-9 text-xs gap-1.5 flex-1"
              >
                {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-primary" />}
                <span>Pick from Device</span>
              </Button>
            </div>

            <Input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Or paste cover photo URL..."
              className="rounded-xl h-9 bg-background/40 text-xs"
            />
          </div>

          {/* Quote */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-primary" />
              Our Motto or Favorite Quote
            </label>
            <Textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="e.g. In all the world, there is no heart for me like yours."
              className="rounded-xl bg-background/60 min-h-[70px] text-sm font-serif"
            />
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
              disabled={loading}
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
