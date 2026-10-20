'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft, Mail, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import type { NotesData } from '@/features/notes/actions';
import { NoteCard } from './note-card';
import { SendNoteDialog } from './send-note-dialog';

interface NotesViewProps {
  data: NotesData;
}

export function NotesView({ data }: NotesViewProps) {
  const { receivedNotes, sentNotes, partnerName } = data;
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [isSendOpen, setIsSendOpen] = useState(false);

  const displayNotes = activeTab === 'received' ? receivedNotes : sentNotes;

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
            <Mail className="w-3.5 h-3.5 text-primary" />
            Sealed Thoughts
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground mt-1">
            Little Notes
          </h1>
        </div>

        <Button
          onClick={() => setIsSendOpen(true)}
          className="rounded-2xl gap-2 h-10 px-4 text-xs font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Leave a Note</span>
        </Button>
      </div>

      {/* Tabs: For You vs Sent */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface/80 border border-border/40 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Notes for You ({receivedNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'sent'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Notes You Left ({sentNotes.length})</span>
          </button>
        </div>
      </div>

      {/* List */}
      {displayNotes.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'received'
              ? 'No notes left for you yet'
              : 'You haven\'t left any notes yet'
          }
          description={
            activeTab === 'received'
              ? 'When your partner leaves a sealed note ("Open when you wake up", "Read when you\'re sad"), it will appear here.'
              : 'Leave a gentle surprise for your partner to discover and open at just the right moment.'
          }
          actionLabel="Leave a sealed note"
          onAction={() => setIsSendOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {displayNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSender={activeTab === 'sent'}
            />
          ))}
        </div>
      )}

      {/* Send Note Dialog */}
      <SendNoteDialog
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        partnerName={partnerName}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
