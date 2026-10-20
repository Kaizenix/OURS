'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Lock,
  Sparkles,
  MessageCircle,
  Heart,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionBankItem, DailyAnswer, Profile } from '@/types/database';
import { submitDailyAnswerAction } from '@/features/daily/actions';

interface QuestionSectionProps {
  todayQuestion: {
    id: string;
    question: QuestionBankItem;
    userAnswer: DailyAnswer | null;
    partnerAnswer: DailyAnswer | null;
    isRevealed: boolean;
  };
  userProfile: Profile;
  partnerProfile: Profile | null;
}

export function QuestionSection({
  todayQuestion,
  userProfile,
  partnerProfile,
}: QuestionSectionProps) {
  const { question, userAnswer, partnerAnswer, isRevealed } = todayQuestion;
  const [answerText, setAnswerText] = useState(userAnswer?.answer || '');
  const [isEditing, setIsEditing] = useState(!userAnswer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasHeartReacted, setHasHeartReacted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setLoading(true);
    setError('');

    try {
      await submitDailyAnswerAction(todayQuestion.id, answerText.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const partnerName = partnerProfile?.display_name || 'Partner';
  const userName = userProfile?.display_name || 'You';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-surface/70 border border-border/40 p-6 md:p-8 backdrop-blur-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Daily Relationship Question
          </span>
        </div>
        <span className="text-xs capitalize px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground font-medium">
          {question.category?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* The Question */}
      <div className="py-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-foreground font-medium leading-relaxed">
          &ldquo;{question.question}&rdquo;
        </h2>
      </div>

      {/* Reveal State or Answering State */}
      <AnimatePresence mode="wait">
        {isRevealed && partnerAnswer && userAnswer && !isEditing ? (
          /* Both answered: Reveal side by side with animation! */
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pt-2"
          >
            <div className="flex items-center justify-center gap-2 py-1 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Answers unlocked! Here is what both of you wrote:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Answer */}
              <div className="rounded-2xl bg-card/60 border border-border/40 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{userName}</span>
                  <span>Your answer</span>
                </div>
                <p className="text-sm font-serif italic text-foreground/90 leading-relaxed pt-1">
                  &ldquo;{userAnswer.answer}&rdquo;
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Edit answer
                  </button>
                </div>
              </div>

              {/* Partner Answer */}
              <div className="rounded-2xl bg-card/60 border border-primary/20 p-5 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{partnerName}</span>
                  <span>Partner&apos;s answer</span>
                </div>
                <p className="text-sm font-serif italic text-foreground/90 leading-relaxed pt-1">
                  &ldquo;{partnerAnswer.answer}&rdquo;
                </p>
              </div>
            </div>

            {/* Interaction Buttons: ❤️ React & 💬 Discuss */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHasHeartReacted(!hasHeartReacted)}
                  className={`rounded-xl gap-2 text-xs transition-colors ${
                    hasHeartReacted
                      ? 'border-primary text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasHeartReacted ? 'fill-primary' : ''}`} />
                  <span>{hasHeartReacted ? 'Loved this' : 'Send love'}</span>
                </Button>
              </div>

              <Link
                href={`/chat?discussQuestion=${encodeURIComponent(question.question)}`}
              >
                <Button size="sm" className="rounded-xl gap-2 text-xs font-medium">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Discuss in Chat</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Answering Form or Waiting for Partner */
          <motion.div
            key="answering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {userAnswer && !isEditing ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-card/50 border border-border/40 p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Your answer</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                    &ldquo;{userAnswer.answer}&rdquo;
                  </p>
                </div>

                {/* Locked partner state */}
                <div className="rounded-2xl bg-card/20 border border-dashed border-border/50 p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted/40 mx-auto flex items-center justify-center text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">
                    Waiting for {partnerName} to answer
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    To keep things honest and exciting, your partner&apos;s answer stays sealed until both of you have answered!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Write your sincere answer:
                  </label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Take your time, speak from the heart..."
                    className="min-h-[120px] rounded-2xl bg-card/50 border-border/40 focus:border-primary text-sm font-serif leading-relaxed"
                    required
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={loading || !answerText.trim()}
                    className="rounded-xl px-6 h-11 text-sm font-medium"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {userAnswer ? 'Update my answer' : 'Submit my answer'}
                  </Button>

                  {userAnswer && (
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
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
