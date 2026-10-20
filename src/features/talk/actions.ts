'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TalkTopic, TalkTopicStatus, Profile } from '@/types/database';

export interface TalkTopicWithInitiator extends TalkTopic {
  initiator: Pick<Profile, 'display_name' | 'avatar_url'>;
  isInitiator: boolean;
}

export async function getTalkTopicsAction(): Promise<TalkTopicWithInitiator[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return [];

  const { data: topics } = await supabase
    .from('talk_topics')
    .select(`
      *,
      initiator:profiles!talk_topics_initiator_id_fkey(display_name, avatar_url)
    `)
    .eq('couple_id', membership.couple_id)
    .order('created_at', { ascending: false });

  if (!topics) return [];

  return topics.map((t) => ({
    ...(t as TalkTopic),
    initiator: (t as unknown as { initiator: Pick<Profile, 'display_name' | 'avatar_url'> }).initiator,
    isInitiator: t.initiator_id === user.id,
  }));
}

export async function createTalkTopicAction(data: {
  topic: string;
  perspective: string;
  feeling: string;
  need: string;
  desired_outcome: string;
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

  const { data: topic, error } = await supabase
    .from('talk_topics')
    .insert({
      couple_id: membership.couple_id,
      initiator_id: user.id,
      topic: data.topic.trim(),
      perspective: data.perspective.trim(),
      feeling: data.feeling.trim(),
      need: data.need.trim(),
      desired_outcome: data.desired_outcome.trim(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/us/talk');
  return topic;
}

export async function partnerReadyAction(topicId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('talk_topics')
    .update({
      status: 'ready',
      partner_ready_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', topicId);

  if (error) throw error;
  revalidatePath('/us/talk');
}

export async function resolveTalkTopicAction(topicId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('talk_topics')
    .update({
      status: 'resolved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', topicId);

  if (error) throw error;
  revalidatePath('/us/talk');
}
