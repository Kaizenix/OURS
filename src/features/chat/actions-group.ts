'use server';

import { createClient } from '@/lib/supabase/server';
import type { ChatGroup, GroupMessage } from '@/types/database';

export async function getChatGroups(): Promise<ChatGroup[]> {
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

    const { data, error } = await supabase
      .from('chat_groups')
      .select('*')
      .eq('couple_id', membership.couple_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat groups:', error);
      return [];
    }

    return (data as ChatGroup[]) || [];
  } catch (err) {
    console.error('Failed to get chat groups:', err);
    return [];
  }
}

export async function createChatGroup(name: string, description?: string): Promise<{ success: boolean; group?: ChatGroup; error?: string }> {
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

    const { data, error } = await supabase
      .from('chat_groups')
      .insert({
        couple_id: membership.couple_id,
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, group: data as ChatGroup };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create group' };
  }
}

export async function getGroupMessages(groupId: string): Promise<GroupMessage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        *,
        sender:profiles(display_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }

    return (data as GroupMessage[]) || [];
  } catch (err) {
    console.error('Failed to get group messages:', err);
    return [];
  }
}

export async function sendGroupMessage(groupId: string, content: string, imageUrl?: string | null) {
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

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: groupId,
        couple_id: membership.couple_id,
        sender_id: user.id,
        content: content.trim() || null,
        image_url: imageUrl || null,
      })
      .select(`
        *,
        sender:profiles(display_name, avatar_url)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send group message' };
  }
}
