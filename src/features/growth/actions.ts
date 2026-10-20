'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateRelationshipDuration } from '@/lib/date-utils';
import type { Couple } from '@/types/database';

export interface GrowthMetrics {
  durationFormatted: string;
  questionsAnswered: number;
  memoriesSaved: number;
  datesCompleted: number;
  goalsAchieved: number;
  conversationsHeld: number;
  checkinsRecorded: number;
}

export async function getRelationshipGrowthAction(): Promise<GrowthMetrics | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id, couples(*)')
    .eq('user_id', user.id)
    .single();

  if (!membership || !membership.couples) return null;

  const coupleId = membership.couple_id;
  const couple = (membership as unknown as { couples: Couple }).couples;
  const duration = calculateRelationshipDuration(couple.start_date);

  // 1. Questions answered count
  const { count: questionsCount } = await supabase
    .from('daily_answers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 2. Memories saved
  const { count: memoriesCount } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId);

  // 3. Dates completed
  const { count: datesCount } = await supabase
    .from('date_plans')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
    .eq('status', 'done');

  // 4. Goals completed
  const { count: goalsCount } = await supabase
    .from('goals')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
    .eq('status', 'completed');

  // 5. Talk topics resolved / held
  const { count: talkCount } = await supabase
    .from('talk_topics')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId);

  // 6. Check-ins recorded
  const { count: checkinsCount } = await supabase
    .from('daily_checkins')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId);

  return {
    durationFormatted: duration.formatted,
    questionsAnswered: questionsCount || 0,
    memoriesSaved: memoriesCount || 0,
    datesCompleted: datesCount || 0,
    goalsAchieved: goalsCount || 0,
    conversationsHeld: talkCount || 0,
    checkinsRecorded: checkinsCount || 0,
  };
}
