'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CalendarEvent, EventType } from '@/types/database';

export async function getCalendarEventsAction(): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('couple_id', membership.couple_id)
    .order('event_date', { ascending: true });

  return (events || []) as CalendarEvent[];
}

export async function createCalendarEventAction(data: {
  title: string;
  event_type: EventType;
  event_date: string;
  notes?: string;
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

  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert({
      couple_id: membership.couple_id,
      title: data.title.trim(),
      event_type: data.event_type,
      event_date: data.event_date,
      notes: data.notes?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/calendar');
  revalidatePath('/home');
  return event;
}

export async function deleteCalendarEventAction(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
  revalidatePath('/us/calendar');
  revalidatePath('/home');
}
