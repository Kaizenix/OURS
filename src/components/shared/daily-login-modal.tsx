'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, HelpCircle, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { MOOD_OPTIONS, NEED_OPTIONS } from '@/lib/constants';
import { submitCheckinAction, submitDailyAnswerAction } from '@/features/daily/actions';
import type { MoodType, NeedType, DailyCheckin, QuestionBankItem, DailyAnswer } from '@/types/database';

interface DailyLoginModalProps {
  todayQuestion: {
    id: string;
    question: QuestionBankItem;
    userAnswer: DailyAnswer | null;
  } | null;
  hasCheckedInToday: boolean;
}

export function DailyLoginModal({ todayQuestion, hasCheckedInToday }: DailyLoginModalProps) {
  const [step, setStep] = useState<'checkin' | 'question' | 'closed'>('closed');
  const [mood, setMood] = useState<MoodType>('happy');
  const [energy, setEnergy] = useState<number>(60);
  const [socialBattery, setSocialBattery] = useState<number>(60);
  const [needs, setNeeds] = useState<NeedType[]>([]);
  const [note, setNote] = useState<string>('');
  const [questionAnswer, setQuestionAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `ours_daily_login_done_${todayStr}`;
    const alreadyDone = localStorage.getItem(key);

    if (!alreadyDone) {
      if (!hasCheckedInToday) {
        setStep('checkin');
      } else if (todayQuestion && !todayQuestion.userAnswer) {
        setStep('question');
      }
    }
  }, [hasCheckedInToday, todayQuestion]);

  const closeAll = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`ours_daily_login_done_${todayStr}`, 'true');
    setStep('closed');
  };

  const handleSaveCheckin = async () => {
    setLoading(true);
    try {
      await submitCheckinAction({
        mood,
        energy,
        social_battery: socialBattery,
        needs,
        note: note.trim() || undefined,
      });

      // Move to Daily Question step if not yet answered
      if (todayQuestion && !todayQuestion.userAnswer) {
        setStep('question');
      } else {
        closeAll();
      }
    } catch (err) {
      console.error('Daily check-in modal error:', err);
      closeAll();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!todayQuestion || !questionAnswer.trim()) return;
    setLoading(true);
    try {
      await submitDailyAnswerAction(todayQuestion.id, questionAnswer.trim());
      closeAll();
    } catch (err) {
      console.error('Daily question modal error:', err);
      closeAll();
    } finally {
      setLoading(false);
    }
  };

  const toggleNeed = (needVal: NeedType) => {
    if (needVal === 'nothing_specific') {
      setNeeds(['nothing_specific']);
      return;
    }
    const filtered = needs.filter((n) => n !== 'nothing_specific');
    if (filtered.includes(needVal)) {
      setNeeds(filtered.filter((n) => n !== needVal));
    } else {
      setNeeds([...filtered, needVal]);
    }
  };

  if (step === 'closed') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <AnimatePresence mode="wait">
        {/* STEP 1: DAILY CHECK-IN */}
        {step === 'checkin' && (
          <motion.div
            key="checkin-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium">Daily Check-in</h3>
                  <p className="text-[10px] text-muted-foreground">Kondisi kamu hari ini</p>
                </div>
              </div>
              <button onClick={closeAll} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mood options */}
            <div>
              <label className="text-xs text-muted-foreground block mb-2 font-medium">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                      mood === m.value
                        ? 'bg-primary/15 border-2 border-primary text-foreground font-semibold scale-105'
                        : 'bg-surface/50 border border-border/30 hover:bg-muted/40'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{m.emoji}</span>
                    <span className="text-[10px] truncate w-full">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Energy level</span>
                <span className="font-mono font-medium">{energy}%</span>
              </div>
              <Slider
                value={[energy]}
                onValueChange={(val: any) => {
                  const num = Array.isArray(val) ? val[0] : (typeof val === 'number' ? val : 60);
                  setEnergy(num);
                }}
                min={0}
                max={100}
                step={5}
                className="py-1"
              />
            </div>

            {/* Needs Tags */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">
                What do you need today?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {NEED_OPTIONS.map((n) => {
                  const isSelected = needs.includes(n.value);
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => toggleNeed(n.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-surface/60 border border-border/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {n.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (todayQuestion && !todayQuestion.userAnswer) {
                    setStep('question');
                  } else {
                    closeAll();
                  }
                }}
                className="flex-1 h-10 rounded-xl text-xs font-medium border border-border hover:bg-muted/30"
              >
                Skip
              </button>
              <Button
                type="button"
                onClick={handleSaveCheckin}
                disabled={loading}
                className="flex-1 h-10 rounded-xl text-xs font-medium bg-primary text-primary-foreground"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lanjut'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: DAILY RELATIONSHIP QUESTION */}
        {step === 'question' && todayQuestion && (
          <motion.div
            key="question-modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium">Daily Question</h3>
                  <p className="text-[10px] text-muted-foreground">Pertanyaan harian berdua</p>
                </div>
              </div>
              <button onClick={closeAll} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question card */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-serif text-foreground leading-relaxed">
                &ldquo;{todayQuestion.question.question}&rdquo;
              </p>
            </div>

            {/* Answer textarea */}
            <Textarea
              value={questionAnswer}
              onChange={(e) => setQuestionAnswer(e.target.value)}
              placeholder="Tulis jawaban jujurmu untuk pasangan..."
              rows={3}
              className="rounded-xl text-xs resize-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={closeAll}
                className="flex-1 h-10 rounded-xl text-xs font-medium border border-border hover:bg-muted/30"
              >
                Nanti Saja
              </button>
              <Button
                type="button"
                onClick={handleSaveQuestion}
                disabled={!questionAnswer.trim() || loading}
                className="flex-1 h-10 rounded-xl text-xs font-medium bg-primary text-primary-foreground"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Jawaban'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
