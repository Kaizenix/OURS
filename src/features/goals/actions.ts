'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { GoalWithTasks, GoalCategory, GoalStatus } from '@/types/database';

export async function getGoalsAction(): Promise<GoalWithTasks[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: goals } = await supabase
    .from('goals')
    .select('*, tasks:goal_tasks(*)')
    .eq('couple_id', membership.couple_id)
    .order('created_at', { ascending: false });

  return (goals || []) as unknown as GoalWithTasks[];
}

export async function createGoalAction(data: {
  title: string;
  description?: string;
  category: GoalCategory;
  target_date?: string;
  status?: GoalStatus;
  initialTasks?: string[];
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

  const { data: newGoal, error } = await supabase
    .from('goals')
    .insert({
      couple_id: membership.couple_id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category,
      target_date: data.target_date || null,
      status: data.status || 'someday',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (data.initialTasks && data.initialTasks.length > 0) {
    const taskRows = data.initialTasks
      .filter((t) => t.trim())
      .map((t) => ({
        goal_id: newGoal.id,
        title: t.trim(),
        is_completed: false,
      }));

    if (taskRows.length > 0) {
      await supabase.from('goal_tasks').insert(taskRows);
    }
  }

  revalidatePath('/us/goals');
  revalidatePath('/us');
  return newGoal;
}

export async function updateGoalStatusAction(goalId: string, status: GoalStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('goals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', goalId);

  if (error) throw error;
  revalidatePath('/us/goals');
}

export async function toggleGoalTaskAction(taskId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('goal_tasks')
    .update({
      is_completed: !isCompleted,
      completed_by: !isCompleted ? user.id : null,
    })
    .eq('id', taskId);

  if (error) throw error;
  revalidatePath('/us/goals');
}

export async function addGoalTaskAction(goalId: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('goal_tasks').insert({
    goal_id: goalId,
    title: title.trim(),
    is_completed: false,
  });

  if (error) throw error;
  revalidatePath('/us/goals');
}

export async function deleteGoalAction(goalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('goals').delete().eq('id', goalId);

  if (error) throw error;
  revalidatePath('/us/goals');
}
