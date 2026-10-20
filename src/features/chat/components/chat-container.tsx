'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageCircle, Users } from 'lucide-react';
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
import { DisposableRoomManager } from '@/features/rooms/components/disposable-room-manager';
import { useWebRTCCall } from '@/features/call/hooks/use-webrtc-call';
import { CallModal } from '@/features/call/components/call-modal';
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
  const [activeTab, setActiveTab] = useState<'couple' | 'groups'>('couple');
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

  // WebRTC Call Hook
  const callState = useWebRTCCall(coupleId, userProfile, partnerProfile);

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'couple') {
      scrollToBottom(false);
    }
  }, [activeTab]);

  // Realtime subscription for messages and typing
  useEffect(() => {
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
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const senderProfile =
              newMsg.sender_id === userProfile.id
                ? { display_name: userProfile.display_name, avatar_url: userProfile.avatar_url }
                : { display_name: partnerProfile?.display_name || 'Pasangan', avatar_url: partnerProfile?.avatar_url || null };

            return [...prev, { ...newMsg, sender: senderProfile, reactions: [] }];
          });
          setTimeout(() => scrollToBottom(true), 50);
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

    // Typing broadcast channel
    const typingChannel = supabase.channel(`typing_${coupleId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, (payload: { payload: { sender_id: string } }) => {
        if (payload?.payload?.sender_id !== userProfile.id) {
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
      setPinNotice('Berhasil disimpan ke Kenangan kita!');
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
    <>
      {/* WebRTC Video & Audio Call Modal */}
      <CallModal
        callStatus={callState.callStatus}
        isVideoCall={callState.isVideoCall}
        isMuted={callState.isMuted}
        isCameraOff={callState.isCameraOff}
        callDuration={callState.callDuration}
        partnerProfile={partnerProfile}
        incomingCaller={callState.incomingCaller}
        localVideoRef={callState.localVideoRef}
        remoteVideoRef={callState.remoteVideoRef}
        onAccept={callState.acceptCall}
        onReject={callState.rejectCall}
        onEndCall={callState.endCall}
        onToggleMute={callState.toggleMute}
        onToggleCamera={callState.toggleCamera}
      />

      <div className="flex flex-col h-[calc(100dvh-5.25rem)] md:h-[calc(100dvh-1rem)] max-w-4xl mx-auto rounded-2xl md:rounded-3xl bg-surface/80 border border-border/40 overflow-hidden shadow-xs">
        {/* Sub-tab Switcher: Berdua vs Grup & Topik */}
        <div className="flex items-center justify-center p-1.5 bg-card/60 border-b border-border/40">
          <div className="inline-flex rounded-xl bg-background/80 p-0.5 border border-border/40 text-xs">
            <button
              onClick={() => setActiveTab('couple')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'couple'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ruang Berdua</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'groups'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Room 1x Pakai</span>
            </button>
          </div>
        </div>

        {activeTab === 'groups' ? (
          <DisposableRoomManager
            coupleId={coupleId}
            userProfile={userProfile}
            partnerProfile={partnerProfile}
          />
        ) : (
          <>
            {/* Header with Call buttons */}
            <ChatHeader
              partnerProfile={partnerProfile}
              isPartnerTyping={isPartnerTyping}
              onStartAudioCall={() => callState.startCall(false)}
              onStartVideoCall={() => callState.startCall(true)}
            />

            {/* Notification Toast */}
            {pinNotice && (
              <div className="bg-primary/10 border-b border-primary/20 py-1.5 px-4 text-center text-xs text-primary font-medium">
                {pinNotice}
              </div>
            )}

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 md:px-6 space-y-4"
            >
              {groupedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <p className="font-serif text-lg text-foreground mb-1">Ruang Obrolan Kita</p>
                  <p className="text-xs max-w-xs">
                    Tempat aman untuk saling bertukar pesan, foto, dan cerita setiap hari.
                  </p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date} className="space-y-2.5">
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-0.5 rounded-full text-[10px] bg-muted/40 text-muted-foreground border border-border/40 font-sans">
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

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onTyping={handleBroadcastTyping}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              discussQuestion={discussQuestion}
              onClearDiscussQuestion={() => setDiscussQuestion(null)}
            />
          </>
        )}

        {/* Edit Message Modal */}
        <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-base">Edit Pesan</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit pesanmu..."
                className="rounded-xl h-11 text-sm"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingMessage(null)} className="rounded-xl h-9 text-xs">
                Batal
              </Button>
              <Button onClick={handleEditSubmit} className="rounded-xl h-9 text-xs bg-primary text-primary-foreground">
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
