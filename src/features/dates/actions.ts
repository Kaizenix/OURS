'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DatePlan, DateVote, DatePlanStatus } from '@/types/database';

export interface DatePlanWithVotes extends DatePlan {
  votes: DateVote[];
  userVote?: boolean | null;
  partnerVote?: boolean | null;
}

export async function getDatePlansAction(): Promise<DatePlanWithVotes[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', membership.couple_id)
    .neq('user_id', user.id)
    .maybeSingle();

  const partnerId = partnerMember?.user_id;

  const { data: plans } = await supabase
    .from('date_plans')
    .select('*, votes:date_votes(*)')
    .eq('couple_id', membership.couple_id)
    .order('created_at', { ascending: false });

  if (!plans) return [];

  return plans.map((p) => {
    const votes = (p.votes || []) as DateVote[];
    const userVote = votes.find((v) => v.user_id === user.id)?.vote ?? null;
    const partnerVote = partnerId ? (votes.find((v) => v.user_id === partnerId)?.vote ?? null) : null;

    return {
      ...(p as DatePlan),
      votes,
      userVote,
      partnerVote,
    };
  });
}

export async function createDatePlanAction(data: {
  title: string;
  planned_date?: string;
  planned_time?: string;
  location?: string;
  budget?: string;
  notes?: string;
  status?: DatePlanStatus;
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

  const { data: plan, error } = await supabase
    .from('date_plans')
    .insert({
      couple_id: membership.couple_id,
      title: data.title.trim(),
      planned_date: data.planned_date || null,
      planned_time: data.planned_time || null,
      location: data.location?.trim() || null,
      budget: data.budget?.trim() || null,
      notes: data.notes?.trim() || null,
      status: data.status || 'idea',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/dates');
  return plan;
}

export async function updateDatePlanStatusAction(planId: string, status: DatePlanStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('date_plans')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', planId);

  if (error) throw error;
  revalidatePath('/us/dates');
}

export async function voteDatePlanAction(datePlanId: string, vote: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('date_votes')
    .upsert(
      {
        date_plan_id: datePlanId,
        user_id: user.id,
        vote,
      },
      { onConflict: 'date_plan_id,user_id' }
    );

  if (error) throw error;
  revalidatePath('/us/dates');
}

export async function deleteDatePlanAction(planId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('date_plans')
    .delete()
    .eq('id', planId);

  if (error) throw error;
  revalidatePath('/us/dates');
}
