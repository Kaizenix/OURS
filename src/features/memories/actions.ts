'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MemoryWithMedia } from '@/types/database';

export async function getMemoriesAction(): Promise<MemoryWithMedia[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: memories } = await supabase
    .from('memories')
    .select('*, media:memory_media(*)')
    .eq('couple_id', membership.couple_id)
    .order('memory_date', { ascending: false });

  return (memories || []) as unknown as MemoryWithMedia[];
}

export async function getMemoryByIdAction(id: string): Promise<MemoryWithMedia | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memory } = await supabase
    .from('memories')
    .select('*, media:memory_media(*)')
    .eq('id', id)
    .single();

  return (memory as unknown as MemoryWithMedia) || null;
}

export async function createMemoryAction(data: {
  title: string;
  story?: string;
  memory_date?: string;
  location?: string;
  tags?: string[];
  imageUrl?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) throw new Error('Couple not found');

  const { data: newMemory, error } = await supabase
    .from('memories')
    .insert({
      couple_id: membership.couple_id,
      title: data.title.trim(),
      story: data.story?.trim() || null,
      memory_date: data.memory_date || new Date().toISOString().split('T')[0],
      location: data.location?.trim() || null,
      tags: data.tags || ['Random'],
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (data.imageUrl?.trim()) {
    await supabase.from('memory_media').insert({
      memory_id: newMemory.id,
      url: data.imageUrl.trim(),
      media_type: 'image',
    });
  }

  revalidatePath('/memories');
  revalidatePath('/home');
  return newMemory;
}

export async function toggleFavoriteMemoryAction(memoryId: string, currentFav: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('memories')
    .update({ is_favorite: !currentFav })
    .eq('id', memoryId);

  if (error) throw error;
  revalidatePath('/memories');
  revalidatePath('/home');
}

export async function deleteMemoryAction(memoryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('memories')
    .delete()
    .eq('id', memoryId);

  if (error) throw error;
  revalidatePath('/memories');
  revalidatePath('/home');
}
