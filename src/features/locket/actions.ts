'use server';

import { createClient } from '@/lib/supabase/server';
import type { Snap } from '@/types/database';

export async function getLatestSnap(): Promise<Snap | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return null;

    const { data, error } = await supabase
      .from('snaps')
      .select('*')
      .eq('couple_id', membership.couple_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest snap:', error);
      return null;
    }

    return (data as Snap) || null;
  } catch (err) {
    console.error('Failed to get latest snap:', err);
    return null;
  }
}

export async function sendSnapAction(imageUrl: string, caption?: string) {
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
      .from('snaps')
      .insert({
        couple_id: membership.couple_id,
        user_id: user.id,
        image_url: imageUrl,
        caption: caption?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, snap: data as Snap };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send snap' };
  }
}
