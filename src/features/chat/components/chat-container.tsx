'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { MessageWithSender, Profile } from '@/types/database';
import {
  sendMessageAction,
  editMessageAction,
  deleteMessageAction,
  toggleReactionAction,
  pinToMemoryAction,
} from '@/features/chat/actions';
import { ChatHeader } from './chat-header';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDatePretty } from '@/lib/date-utils';

interface ChatContainerProps {
  coupleId: string;
  userProfile: Profile;
  partnerProfile: Profile | null;
  initialMessages: MessageWithSender[];
}

export function ChatContainer({
  coupleId,
  userProfile,
  partnerProfile,
  initialMessages,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [replyingTo, setReplyingTo] = useState<MessageWithSender | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [pinNotice, setPinNotice] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const discussQuestionParam = searchParams.get('discussQuestion');
  const [discussQuestion, setDiscussQuestion] = useState<string | null>(discussQuestionParam);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  // Supabase Realtime Subscription for Messages and Reactions
  useEffect(() => {
    // 1. Database table changes
    const dbChannel = supabase
      .channel(`chat_${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${coupleId}`,
        },
        async (payload) => {
          const newMsg = payload.new as MessageWithSender;
          // Avoid duplicates if we already added it optimistically
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Fetch sender profile details if needed or populate
            const senderProfile =
              newMsg.sender_id === userProfile.id
                ? { display_name: userProfile.display_name, avatar_url: userProfile.avatar_url }
                : { display_name: partnerProfile?.display_name || 'Partner', avatar_url: partnerProfile?.avatar_url || null };

            return [...prev, { ...newMsg, sender: senderProfile, reactions: [] }];
          });
          setTimeout(() => scrollToBottom(true), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          const updated = payload.new as MessageWithSender;
          setMessages((prev) => {
            if (updated.deleted_at) {
              return prev.filter((m) => m.id !== updated.id);
            }
            return prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        async () => {
          // Refresh reactions
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              reactions:message_reactions(*)
            `)
            .eq('couple_id', coupleId);

          if (data) {
            setMessages((prev) =>
              prev.map((m) => {
                const found = data.find((d: { id: string }) => d.id === m.id);
                return found ? { ...m, reactions: (found as unknown as { reactions: [] }).reactions } : m;
              })
            );
          }
        }
      )
      .subscribe();

    // 2. Realtime Broadcast Channel for typing events
    const typingChannel = supabase.channel(`typing_${coupleId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.sender_id !== userProfile.id) {
          setIsPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [coupleId, userProfile, partnerProfile, supabase]);

  const handleBroadcastTyping = () => {
    supabase.channel(`typing_${coupleId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_id: userProfile.id },
    });
  };

  const handleSendMessage = async (content: string, imageUrl?: string | null) => {
    try {
      const created = await sendMessageAction({
        coupleId,
        content,
        replyToId: replyingTo?.id,
        imageUrl,
      });

      setReplyingTo(null);
      // Optimistic update if needed
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingMessage || !editContent.trim()) return;
    try {
      await editMessageAction(editingMessage.id, editContent);
      setMessages((prev) =>
        prev.map((m) => (m.id === editingMessage.id ? { ...m, content: editContent.trim(), is_edited: true } : m))
      );
      setEditingMessage(null);
    } catch (err) {
      console.error('Error editing message:', err);
    }
  };

  const handleDelete = async (msgId: string) => {
    try {
      await deleteMessageAction(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    try {
      await toggleReactionAction(msgId, emoji);
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  const handlePinToMemory = async (msgId: string) => {
    try {
      await pinToMemoryAction(msgId, coupleId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_memory: true, is_pinned: true } : m))
      );
      setPinNotice('Saved to your couple Memories!');
      setTimeout(() => setPinNotice(null), 3000);
    } catch (err) {
      console.error('Error pinning message:', err);
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; items: MessageWithSender[] }[] = [];
  messages.forEach((msg) => {
    const dateStr = new Date(msg.created_at).toISOString().split('T')[0];
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.items.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, items: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100dvh-1rem)] max-w-4xl mx-auto rounded-3xl bg-surface/50 border border-border/40 overflow-hidden shadow-xs">
      {/* Header */}
      <ChatHeader
        partnerProfile={partnerProfile}
        isPartnerTyping={isPartnerTyping}
      />

      {/* Pin Notification Banner */}
      {pinNotice && (
        <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-medium transition-all">
          {pinNotice}
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {groupedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <p className="font-serif text-lg mb-1">A quiet, private room.</p>
            <p className="text-xs max-w-xs">
              Every message here stays between just the two of you. Say hello to start your day.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 rounded-full bg-background/80 border border-border/40 text-[11px] text-muted-foreground font-medium backdrop-blur-xs">
                  {formatDatePretty(group.date)}
                </span>
              </div>

              {group.items.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_id === userProfile.id}
                  onReply={(m) => setReplyingTo(m)}
                  onEdit={(m) => {
                    setEditingMessage(m);
                    setEditContent(m.content || '');
                  }}
                  onDelete={handleDelete}
                  onReact={handleReaction}
                  onPinToMemory={handlePinToMemory}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        discussQuestion={discussQuestion}
        onClearDiscussQuestion={() => setDiscussQuestion(null)}
        onTyping={handleBroadcastTyping}
      />

      {/* Edit Message Modal */}
      {editingMessage && (
        <Dialog open={Boolean(editingMessage)} onOpenChange={() => setEditingMessage(null)}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-serif">Edit Message</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="rounded-xl h-11"
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingMessage(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSubmit} disabled={!editContent.trim()}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
