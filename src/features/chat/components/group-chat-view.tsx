'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import {
  getChatGroups,
  createChatGroup,
  getGroupMessages,
  sendGroupMessage,
} from '../actions-group';
import { uploadFileToStorage } from '@/lib/supabase/storage';
import { formatTimePretty } from '@/lib/date-utils';
import type { ChatGroup, GroupMessage, Profile } from '@/types/database';

interface GroupChatViewProps {
  coupleId: string;
  userProfile: Profile;
  partnerProfile: Profile | null;
}

export function GroupChatView({
  coupleId,
  userProfile,
  partnerProfile,
}: GroupChatViewProps) {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load groups
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getChatGroups();
      setGroups(res);
      setLoading(false);
    }
    load();
  }, [coupleId]);

  // Load messages when active group changes
  useEffect(() => {
    if (!activeGroup) return;

    async function loadMsgs() {
      const msgs = await getGroupMessages(activeGroup!.id);
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
      }, 50);
    }
    loadMsgs();

    // Subscribe to group messages realtime
    const channel = supabase
      .channel(`group_msgs_${activeGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${activeGroup.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as GroupMessage;
          const sender =
            newMsg.sender_id === userProfile.id
              ? { display_name: userProfile.display_name, avatar_url: userProfile.avatar_url }
              : { display_name: partnerProfile?.display_name || 'Teman', avatar_url: partnerProfile?.avatar_url || null };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, sender }];
          });

          setTimeout(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
          }, 50);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeGroup, coupleId, supabase, userProfile, partnerProfile]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    const res = await createChatGroup(newGroupName.trim(), newGroupDesc.trim() || undefined);
    if (res.success && res.group) {
      setGroups((prev) => [...prev, res.group!]);
      setActiveGroup(res.group);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    }
    setCreating(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || sending || !activeGroup) return;

    setSending(true);
    const text = inputText.trim();
    setInputText('');
    await sendGroupMessage(activeGroup.id, text);
    setSending(false);
  };

  const handleSendPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeGroup) return;

    setUploading(true);
    try {
      const url = await uploadFileToStorage(file, 'photos', 'groups');
      await sendGroupMessage(activeGroup.id, '', url);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  // Group Detail Screen
  if (activeGroup) {
    return (
      <div className="flex flex-col h-full bg-background select-none">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 bg-card/60">
          <button
            onClick={() => setActiveGroup(null)}
            className="p-1.5 -ml-1 rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium leading-tight truncate">{activeGroup.name}</h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeGroup.description || 'Grup & Topik Khusus'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground text-xs">
              <Sparkles className="w-8 h-8 text-primary/40 mb-2" />
              <p>Belum ada pesan di grup ini.</p>
              <p className="text-[11px] opacity-75 mt-0.5">Mulai obrolan topik bersama pasangan!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isOwn = m.sender_id === userProfile.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-1.5 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-border bg-surface shrink-0 text-[10px] flex items-center justify-center mb-0.5">
                        {m.sender?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{(m.sender?.display_name || 'P').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-card text-foreground rounded-bl-xs border border-border/40'
                      }`}
                    >
                      {!isOwn && (
                        <span className="block text-[10px] font-medium text-primary mb-0.5">
                          {m.sender?.display_name || 'Pasangan'}
                        </span>
                      )}
                      {m.image_url && (
                        <div className="mb-1 rounded-xl overflow-hidden max-w-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.image_url} alt="" className="w-full h-auto object-cover max-h-60" />
                        </div>
                      )}
                      {m.content && <p className="leading-relaxed text-[13px]">{m.content}</p>}
                      <span className={`block text-[9px] mt-0.5 text-right ${isOwn ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {formatTimePretty(m.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-2 border-t border-border/40 bg-background/95">
          <form onSubmit={handleSend} className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSendPhoto}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/40"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ImageIcon className="w-4 h-4" />}
            </button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik pesan grup..."
              disabled={sending}
              className="h-10 rounded-2xl text-sm bg-card border-border/40"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputText.trim() || sending}
              className="h-10 w-10 p-0 rounded-full shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Group List Screen
  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg font-medium">Grup & Saluran Topik</h3>
          <p className="text-xs text-muted-foreground">Ruang obrolan khusus tema & lingkaran bersama</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="h-8 rounded-xl gap-1.5 text-xs bg-primary text-primary-foreground"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Grup</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Memuat grup...
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/60 text-center my-auto">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-medium mb-1">Belum Ada Grup</h4>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">
            Buat grup obrolan atau saluran khusus seperti Rencana Liburan, Wishlist, Double Date, atau Keluarga.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="rounded-xl h-9 text-xs"
          >
            Buat Saluran Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/40 hover:border-primary/50 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium leading-tight truncate">{g.name}</h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {g.description || 'Ketuk untuk membuka obrolan'}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal Buat Grup */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Buat Saluran / Grup Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Nama Grup / Topik</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Contoh: Rencana Liburan Bali, Double Date"
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Deskripsi Singkat (Opsional)</label>
              <Input
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="Untuk merencanakan perjalanan kita"
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="rounded-xl h-10 text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || creating}
              className="rounded-xl h-10 text-xs bg-primary text-primary-foreground"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Buat Grup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
