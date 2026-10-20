'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Journal, JournalVisibility } from '@/types/database';

export async function getJournalsAction(): Promise<Journal[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  // RLS automatically enforces that private journals belonging to the partner are NEVER returned!
  const { data: journals } = await supabase
    .from('journals')
    .select('*')
    .eq('couple_id', membership.couple_id)
    .order('created_at', { ascending: false });

  return (journals || []) as Journal[];
}

export async function createJournalAction(data: {
  title: string;
  content: string;
  mood?: string;
  visibility: JournalVisibility;
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

  const { data: journal, error } = await supabase
    .from('journals')
    .insert({
      couple_id: membership.couple_id,
      user_id: user.id,
      title: data.title.trim(),
      content: data.content.trim(),
      mood: data.mood?.trim() || null,
      visibility: data.visibility,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/journal');
  return journal;
}

export async function deleteJournalAction(journalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('journals')
    .delete()
    .eq('id', journalId)
    .eq('user_id', user.id); // Only creator can delete

  if (error) throw error;
  revalidatePath('/us/journal');
}
