'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquareHeart,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TalkTopicWithInitiator } from '@/features/talk/actions';
import { formatDatePretty } from '@/lib/date-utils';
import { partnerReadyAction, resolveTalkTopicAction } from '@/features/talk/actions';

interface TalkTopicCardProps {
  topic: TalkTopicWithInitiator;
}

export function TalkTopicCard({ topic }: TalkTopicCardProps) {
  const [status, setStatus] = useState(topic.status);
  const [loading, setLoading] = useState(false);

  const initiatorName = topic.initiator?.display_name || 'Your partner';

  const handleReadyToTalk = async () => {
    setLoading(true);
    try {
      await partnerReadyAction(topic.id);
      setStatus('ready');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      await resolveTalkTopicAction(topic.id);
      setStatus('resolved');
    } finally {
      setLoading(false);
    }
  };

  const isResolved = status === 'resolved';
  const isReady = status === 'ready';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-5 sm:p-6 backdrop-blur-sm shadow-xs transition-all space-y-4 ${
        isResolved
          ? 'bg-card/30 border-border/20 opacity-70'
          : 'bg-surface/80 border-border/40 hover:border-primary/40'
      }`}
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">
            {topic.isInitiator ? 'You opened this talk' : `${initiatorName} wants to talk about something`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
          <span>{formatDatePretty(topic.created_at)}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
              isResolved
                ? 'bg-muted/40 text-muted-foreground border-border/30'
                : isReady
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}
          >
            {isResolved ? 'Resolved with care' : isReady ? 'Ready to discuss' : 'Waiting for partner'}
          </span>
        </div>
      </div>

      {/* Main Topic */}
      <div>
        <h3 className="text-lg font-serif font-medium text-foreground">
          {topic.topic}
        </h3>
      </div>

      {/* The 4 Perspective Sections */}
      <div className="space-y-3 bg-card/40 rounded-2xl p-4 border border-border/20 text-xs sm:text-sm font-serif">
        {topic.perspective && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans block mb-0.5">
              Perspective
            </span>
            <p className="text-foreground/90 italic">&ldquo;{topic.perspective}&rdquo;</p>
          </div>
        )}

        {topic.feeling && (
          <div className="pt-2 border-t border-border/20">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans block mb-0.5">
              Feeling
            </span>
            <p className="text-foreground/90 italic">&ldquo;{topic.feeling}&rdquo;</p>
          </div>
        )}

        {topic.need && (
          <div className="pt-2 border-t border-border/20">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans block mb-0.5">
              What is needed
            </span>
            <p className="text-foreground/90 italic">&ldquo;{topic.need}&rdquo;</p>
          </div>
        )}

        {topic.desired_outcome && (
          <div className="pt-2 border-t border-border/20">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans block mb-0.5">
              Hoped outcome
            </span>
            <p className="text-foreground/90 italic">&ldquo;{topic.desired_outcome}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!topic.isInitiator && !isReady && !isResolved && (
            <Button
              size="sm"
              onClick={handleReadyToTalk}
              disabled={loading}
              className="rounded-xl text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I&apos;m ready to talk</span>
            </Button>
          )}

          {isReady && !isResolved && (
            <Link
              href={`/chat?discussQuestion=${encodeURIComponent(`Talk Space: ${topic.topic}`)}`}
            >
              <Button size="sm" className="rounded-xl text-xs gap-1.5 font-medium">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open in Chat to discuss</span>
              </Button>
            </Link>
          )}
        </div>

        {!isResolved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResolve}
            disabled={loading}
            className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            Mark as resolved
          </Button>
        )}
      </div>
    </motion.div>
  );
}
