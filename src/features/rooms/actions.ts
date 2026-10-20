'use server';

import { createClient } from '@/lib/supabase/server';
import type { MemoryWithMedia } from '@/types/database';

export interface EphemeralRoom {
  id: string;
  couple_id: string;
  room_code: string;
  title: string;
  created_by: string;
  is_revoked: boolean;
  expires_at: string;
  created_at: string;
}

export interface EphemeralMessage {
  id: string;
  room_id: string;
  sender_name: string;
  sender_id: string;
  is_host: boolean;
  content: string | null;
  image_url: string | null;
  created_at: string;
}

export async function createDisposableRoomAction(title: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return { success: false, error: 'No couple found' };

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const roomCode = 'ROOM-' + Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');

    const { data, error } = await supabase
      .from('ephemeral_rooms')
      .insert({
        couple_id: membership.couple_id,
        room_code: roomCode,
        title: title.trim() || 'Disposable Couple Room',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, room: data as EphemeralRoom };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create room' };
  }
}

export async function getActiveDisposableRoomsAction(): Promise<EphemeralRoom[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return [];

    const { data } = await supabase
      .from('ephemeral_rooms')
      .select('*')
      .eq('couple_id', membership.couple_id)
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    return (data as EphemeralRoom[]) || [];
  } catch (err) {
    console.error('Error fetching active rooms:', err);
    return [];
  }
}

export async function revokeDisposableRoomAction(roomId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Soft revoke and delete
    await supabase
      .from('ephemeral_rooms')
      .update({ is_revoked: true })
      .eq('id', roomId)
      .eq('created_by', user.id);

    // Delete messages to clean up immediately
    await supabase
      .from('ephemeral_messages')
      .delete()
      .eq('room_id', roomId);

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to revoke room' };
  }
}

export async function getDisposableRoomByCodeAction(roomCode: string): Promise<EphemeralRoom | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ephemeral_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase().trim())
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    return (data as EphemeralRoom) || null;
  } catch (err) {
    console.error('Error finding room by code:', err);
    return null;
  }
}

export async function getEphemeralMessagesAction(roomId: string): Promise<EphemeralMessage[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ephemeral_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100);

    return (data as EphemeralMessage[]) || [];
  } catch (err) {
    console.error('Error fetching ephemeral messages:', err);
    return [];
  }
}

export async function sendEphemeralMessageAction(data: {
  roomId: string;
  senderName: string;
  senderId: string;
  isHost: boolean;
  content: string;
  imageUrl?: string | null;
}) {
  try {
    const supabase = await createClient();
    const newRecord = {
      room_id: data.roomId,
      sender_name: data.senderName.trim(),
      sender_id: data.senderId,
      is_host: data.isHost,
      content: data.content.trim() || null,
      image_url: data.imageUrl || null,
    };

    const { data: created, error } = await supabase
      .from('ephemeral_messages')
      .insert(newRecord)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error inserting ephemeral message:', error);
      return { success: false, error: error.message };
    }

    const message = created || {
      id: 'ephemeral_' + Date.now(),
      ...newRecord,
      created_at: new Date().toISOString(),
    };

    return { success: true, message: message as EphemeralMessage };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' };
  }
}

export async function getSharedMemoriesForRoomAction(coupleId: string): Promise<MemoryWithMedia[]> {
  try {
    const supabase = await createClient();
    const { data: memories } = await supabase
      .from('memories')
      .select('*, media:memory_media(*)')
      .eq('couple_id', coupleId)
      .order('memory_date', { ascending: false })
      .limit(30);

    return (memories || []) as unknown as MemoryWithMedia[];
  } catch (err) {
    console.error('Error fetching shared memories for room:', err);
    return [];
  }
}
