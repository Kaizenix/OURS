'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { LittleNote, NoteCondition } from '@/types/database';

export interface NotesData {
  receivedNotes: LittleNote[];
  sentNotes: LittleNote[];
  partnerName: string;
}

export async function getNotesAction(): Promise<NotesData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { receivedNotes: [], sentNotes: [], partnerName: 'Partner' };

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return { receivedNotes: [], sentNotes: [], partnerName: 'Partner' };

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id, profiles(display_name)')
    .eq('couple_id', membership.couple_id)
    .neq('user_id', user.id)
    .maybeSingle();

  const partnerName = (partnerMember?.profiles as unknown as { display_name?: string })?.display_name || 'Partner';

  const { data: notes } = await supabase
    .from('little_notes')
    .select('*')
    .eq('couple_id', membership.couple_id)
    .order('created_at', { ascending: false });

  const allNotes = (notes || []) as LittleNote[];
  const receivedNotes = allNotes.filter((n) => n.recipient_id === user.id);
  const sentNotes = allNotes.filter((n) => n.sender_id === user.id);

  return { receivedNotes, sentNotes, partnerName };
}

export async function createNoteAction(data: {
  title: string;
  content: string;
  open_condition: NoteCondition;
  open_date?: string;
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

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', membership.couple_id)
    .neq('user_id', user.id)
    .single();

  if (!partnerMember) throw new Error('Partner has not joined yet');

  const { data: note, error } = await supabase
    .from('little_notes')
    .insert({
      couple_id: membership.couple_id,
      sender_id: user.id,
      recipient_id: partnerMember.user_id,
      title: data.title.trim(),
      content: data.content.trim(),
      open_condition: data.open_condition,
      open_date: data.open_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/notes');
  revalidatePath('/home');
  return note;
}

export async function openNoteAction(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('little_notes')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('recipient_id', user.id);

  if (error) throw error;
  revalidatePath('/us/notes');
  revalidatePath('/home');
}

export async function deleteNoteAction(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('little_notes')
    .delete()
    .eq('id', noteId)
    .eq('sender_id', user.id);

  if (error) throw error;
  revalidatePath('/us/notes');
  revalidatePath('/home');
}
