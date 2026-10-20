'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, MessageSquareHeart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { TalkTopicWithInitiator } from '@/features/talk/actions';
import { TalkTopicCard } from './talk-topic-card';
import { StartTalkDialog } from './start-talk-dialog';

interface TalkSpaceViewProps {
  initialTopics: TalkTopicWithInitiator[];
}

export function TalkSpaceView({ initialTopics }: TalkSpaceViewProps) {
  const [topics, setTopics] = useState<TalkTopicWithInitiator[]>(initialTopics);
  const [isStartOpen, setIsStartOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Back to Us */}
      <Link
        href="/us"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Us</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
            <MessageSquareHeart className="w-3.5 h-3.5 text-primary" />
            Gentle Resolution
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Talk Space
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            A safe, structured way to express perspectives and needs before small misunderstandings turn into arguments.
          </p>
        </div>

        <Button
          onClick={() => setIsStartOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>I Want to Talk</span>
        </Button>
      </div>

      {/* Topics list */}
      {topics.length === 0 ? (
        <EmptyState
          title="No open talk topics"
          description="Everything is peaceful. When either of you needs to discuss something delicate, start here with calm, structured prompts."
          actionLabel="Start a discussion"
          onAction={() => setIsStartOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <TalkTopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}

      {/* Start Talk Dialog */}
      <StartTalkDialog
        open={isStartOpen}
        onOpenChange={setIsStartOpen}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
