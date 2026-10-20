'use client';

import { useState, useRef } from 'react';
import { Loader2, Plus, Calendar, MapPin, Tag, Image as ImageIcon, Upload, X } from 'lucide-react';
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
import { MEMORY_TAGS } from '@/lib/constants';
import { createMemoryAction } from '@/features/memories/actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';

interface AddMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMemoryDialog({ open, onOpenChange, onSuccess }: AddMemoryDialogProps) {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Date']);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const uploadedUrl = await uploadFileToStorage(file, 'photos', 'memories');
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.warn('Storage upload fallback:', err);
      // Fallback: local object URL preview for dev or if storage bucket is not configured yet
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await createMemoryAction({
        title: title.trim(),
        story: story.trim() || undefined,
        memory_date: memoryDate,
        location: location.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        tags: selectedTags,
      });

      // Reset
      setTitle('');
      setStory('');
      setLocation('');
      setImageUrl('');
      setSelectedTags(['Date']);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg p-6 bg-surface border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            Save a Special Memory
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Memory Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our first late-night drive"
              className="rounded-xl h-11 bg-background/60 text-sm font-medium"
              required
            />
          </div>

          {/* Photo: Upload from Camera/Gallery or URL */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Photo (Camera / Gallery or Link)
              </span>
              {uploadingImage && <span className="text-[11px] text-primary animate-pulse">Uploading...</span>}
            </label>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-card border border-border/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Memory preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex-1 rounded-xl h-11 border-dashed border-border/60 text-xs gap-2"
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-primary" />}
                  <span>Choose from Gallery / Camera</span>
                </Button>
              </div>
            )}

            {!imageUrl && (
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image URL directly..."
                className="rounded-xl h-9 bg-background/40 text-xs"
              />
            )}
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Date
              </label>
              <Input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kyoto / Coffee shop"
                className="rounded-xl h-11 bg-background/60 text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MEMORY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">The Story & Details</label>
            <Textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="We didn't even know where we were going, but the air was quiet and..."
              className="rounded-xl bg-background/60 min-h-[90px] text-sm font-serif leading-relaxed"
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
              disabled={loading || !title.trim()}
              className="rounded-xl px-5 text-xs font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Memory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
