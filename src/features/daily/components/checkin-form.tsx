'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, Sparkles, Zap, BatteryCharging, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { MOOD_OPTIONS, NEED_OPTIONS } from '@/lib/constants';
import type { DailyCheckin, MoodType, NeedType } from '@/types/database';
import { submitCheckinAction } from '@/features/daily/actions';

interface CheckinFormProps {
  existingCheckin: DailyCheckin | null;
  onSuccess?: () => void;
}

export function CheckinForm({ existingCheckin, onSuccess }: CheckinFormProps) {
  const [mood, setMood] = useState<MoodType>(existingCheckin?.mood || 'happy');
  const [energy, setEnergy] = useState<number>(existingCheckin?.energy ?? 60);
  const [socialBattery, setSocialBattery] = useState<number>(existingCheckin?.social_battery ?? 60);
  const [needs, setNeeds] = useState<NeedType[]>(existingCheckin?.needs || []);
  const [note, setNote] = useState<string>(existingCheckin?.note || '');
  const [isEditing, setIsEditing] = useState(!existingCheckin);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleNeed = (needVal: NeedType) => {
    if (needVal === 'nothing_specific') {
      setNeeds(['nothing_specific']);
      return;
    }

    setNeeds((prev) => {
      const filtered = prev.filter((n) => n !== 'nothing_specific');
      if (filtered.includes(needVal)) {
        return filtered.filter((n) => n !== needVal);
      } else {
        return [...filtered, needVal];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitCheckinAction({
        mood,
        energy,
        social_battery: socialBattery,
        needs,
        note: note.trim() || undefined,
      });

      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save check-in');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing && existingCheckin) {
    const currentMood = MOOD_OPTIONS.find((m) => m.value === existingCheckin.mood);

    return (
      <div className="rounded-3xl bg-surface/70 border border-border/40 p-6 backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentMood?.emoji}</span>
            <div>
              <p className="text-xs text-muted-foreground">Your Check-in Today</p>
              <h3 className="text-base font-medium capitalize text-foreground">{currentMood?.label}</h3>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="rounded-xl text-xs"
          >
            Edit check-in
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-card/40 rounded-2xl p-3 border border-border/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Energy
              </span>
              <span className="font-mono">{existingCheckin.energy}%</span>
            </div>
            <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${existingCheckin.energy}%` }} />
            </div>
          </div>

          <div className="bg-card/40 rounded-2xl p-3 border border-border/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                Social
              </span>
              <span className="font-mono">{existingCheckin.social_battery}%</span>
            </div>
            <div className="w-full bg-border/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full" style={{ width: `${existingCheckin.social_battery}%` }} />
            </div>
          </div>
        </div>

        {existingCheckin.needs && existingCheckin.needs.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">What you needed:</p>
            <div className="flex flex-wrap gap-1.5">
              {existingCheckin.needs.map((n) => (
                <span
                  key={n}
                  className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                >
                  {NEED_OPTIONS.find((opt) => opt.value === n)?.label || n}
                </span>
              ))}
            </div>
          </div>
        )}

        {existingCheckin.note && (
          <div className="bg-card/30 rounded-2xl p-3 border border-border/20 text-xs italic text-secondary-foreground/90">
            &ldquo;{existingCheckin.note}&rdquo;
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 md:p-8 backdrop-blur-sm space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-serif text-foreground">How are you feeling today?</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          A gentle check-in for your partner to understand where you are at.
        </p>
      </div>

      {/* Mood Selector */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Mood
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = mood === m.value;
            return (
              <button
                type="button"
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                  isSelected
                    ? 'bg-primary/15 border-primary text-foreground shadow-sm scale-102'
                    : 'bg-card/40 border-border/30 hover:border-border/80 text-muted-foreground'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders: Energy & Social Battery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-3 bg-card/30 p-4 rounded-2xl border border-border/20">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Physical Energy
            </span>
            <span className="font-mono text-muted-foreground">{energy}%</span>
          </div>
          <Slider
            value={[energy]}
            onValueChange={(val) => {
              if (typeof val === 'number') setEnergy(val);
              else if (Array.isArray(val) && val.length > 0) setEnergy(val[0]);
            }}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Drained</span>
            <span>Balanced</span>
            <span>Vibrant</span>
          </div>
        </div>

        <div className="space-y-3 bg-card/30 p-4 rounded-2xl border border-border/20">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
              Social Battery
            </span>
            <span className="font-mono text-muted-foreground">{socialBattery}%</span>
          </div>
          <Slider
            value={[socialBattery]}
            onValueChange={(val) => {
              if (typeof val === 'number') setSocialBattery(val);
              else if (Array.isArray(val) && val.length > 0) setSocialBattery(val[0]);
            }}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Need quiet</span>
            <span>Social</span>
            <span>Open to anyone</span>
          </div>
        </div>
      </div>

      {/* What do you need today */}
      <div className="space-y-3 pt-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-primary" />
          What do you need today?
        </label>
        <div className="flex flex-wrap gap-2">
          {NEED_OPTIONS.map((item) => {
            const isSelected = needs.includes(item.value);
            return (
              <button
                type="button"
                key={item.value}
                onClick={() => toggleNeed(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card/40 border-border/40 text-muted-foreground hover:border-border'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-2 pt-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Anything you want your partner to know? (Optional)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Long day at work, just want some calm tea and company tonight..."
          className="rounded-2xl bg-card/50 border-border/40 focus:border-primary text-sm min-h-[80px]"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl px-6 h-11 text-sm font-medium"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4 mr-2" />
          ) : null}
          {savedSuccess ? 'Check-in saved' : 'Save today\'s check-in'}
        </Button>

        {existingCheckin && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="rounded-xl text-xs text-muted-foreground"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  );
}
