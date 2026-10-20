'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MessageWithSender, Profile } from '@/types/database';

export interface ChatInitialData {
  coupleId: string;
  userProfile: Profile;
  partnerProfile: Profile | null;
  initialMessages: MessageWithSender[];
}

export async function getChatInitialData(): Promise<ChatInitialData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) return null;

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return null;
  const coupleId = membership.couple_id;

  // Direct lookup of partner user_id
  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', coupleId)
    .neq('user_id', user.id)
    .maybeSingle();

  let partnerProfile: Profile | null = null;
  if (partnerMember?.user_id) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerMember.user_id)
      .maybeSingle();
    partnerProfile = p;
  }

  // Fetch messages with sender profile and reactions
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(display_name, avatar_url),
      reactions:message_reactions(*)
    `)
    .eq('couple_id', coupleId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(100);

  return {
    coupleId,
    userProfile,
    partnerProfile,
    initialMessages: (messages || []) as unknown as MessageWithSender[],
  };
}

export async function sendMessageAction(data: {
  coupleId: string;
  content: string;
  replyToId?: string | null;
  imageUrl?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: newMsg, error } = await supabase
    .from('messages')
    .insert({
      couple_id: data.coupleId,
      sender_id: user.id,
      content: data.content.trim() || null,
      reply_to: data.replyToId || null,
      image_url: data.imageUrl || null,
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(display_name, avatar_url),
      reactions:message_reactions(*)
    `)
    .single();

  if (error) throw error;
  return newMsg as unknown as MessageWithSender;
}

export async function editMessageAction(messageId: string, newContent: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('messages')
    .update({
      content: newContent.trim(),
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('sender_id', user.id);

  if (error) throw error;
}

export async function deleteMessageAction(messageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('messages')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('sender_id', user.id);

  if (error) throw error;
}

export async function toggleReactionAction(messageId: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if exists
  const { data: existing } = await supabase
    .from('message_reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from('message_reactions').delete().eq('id', existing.id);
  } else {
    await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });
  }
}

export async function pinToMemoryAction(messageId: string, coupleId: string, customTitle?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Get message
  const { data: msg } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (!msg) throw new Error('Message not found');

  // 2. Mark message as pinned & memory
  await supabase
    .from('messages')
    .update({ is_pinned: true, is_memory: true })
    .eq('id', messageId);

  // 3. Insert into memories
  const title = customTitle || (msg.content ? msg.content.slice(0, 30) + '...' : 'A pinned moment');
  const { data: newMemory, error: memError } = await supabase
    .from('memories')
    .insert({
      couple_id: coupleId,
      title,
      story: msg.content || 'From our chat conversation',
      memory_date: new Date().toISOString().split('T')[0],
      tags: ['Favorite', 'Random'],
      is_favorite: true,
      created_by: user.id,
    })
    .select()
    .single();

  if (memError) throw memError;

  // 4. If message has an image, attach it to memory_media
  if (msg.image_url) {
    await supabase.from('memory_media').insert({
      memory_id: newMemory.id,
      url: msg.image_url,
      media_type: 'image',
    });
  }

  revalidatePath('/memories');
  revalidatePath('/home');
  return newMemory;
}
