'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Milestone } from '@/types/database';

export async function getMilestonesAction(): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('couple_id', membership.couple_id)
    .order('milestone_date', { ascending: true });

  return (milestones || []) as Milestone[];
}

export async function createMilestoneAction(data: {
  title: string;
  description?: string;
  milestone_date: string;
  icon?: string;
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

  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert({
      couple_id: membership.couple_id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      milestone_date: data.milestone_date,
      icon: data.icon || 'Heart',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/timeline');
  revalidatePath('/us');
  return milestone;
}

export async function deleteMilestoneAction(milestoneId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) throw error;
  revalidatePath('/us/timeline');
  revalidatePath('/us');
}
