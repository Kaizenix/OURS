'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CoupleWithMembers, MemoryWithMedia, Profile, Couple } from '@/types/database';

export interface OurStoryData {
  userProfile: Profile;
  partnerProfile: Profile | null;
  couple: Couple;
  favoriteMemory: MemoryWithMedia | null;
}

export async function getOurStoryData(): Promise<OurStoryData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) return null;

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id, role, couples(*)')
    .eq('user_id', user.id)
    .single();

  if (!membership || !membership.couples) return null;

  const coupleId = membership.couple_id;
  const couple = (membership as unknown as { couples: Couple }).couples;

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id, profiles(*)')
    .eq('couple_id', coupleId)
    .neq('user_id', user.id)
    .maybeSingle();

  const partnerProfile = partnerMember && partnerMember.profiles
    ? (partnerMember as unknown as { profiles: Profile }).profiles
    : null;

  // Favorite memory
  const { data: favMemories } = await supabase
    .from('memories')
    .select('*, media:memory_media(*)')
    .eq('couple_id', coupleId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })
    .limit(1);

  const favoriteMemory = favMemories && favMemories.length > 0
    ? (favMemories[0] as unknown as MemoryWithMedia)
    : null;

  return {
    userProfile,
    partnerProfile,
    couple,
    favoriteMemory,
  };
}

export async function updateCoupleStoryAction(data: {
  name?: string;
  start_date?: string;
  cover_image_url?: string;
  quote?: string;
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

  const { error } = await supabase
    .from('couples')
    .update({
      name: data.name?.trim() || null,
      start_date: data.start_date || null,
      cover_image_url: data.cover_image_url?.trim() || null,
      quote: data.quote?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.couple_id);

  if (error) throw error;
  revalidatePath('/us/profile');
  revalidatePath('/us');
  revalidatePath('/home');
}

export async function updateMyProfileAction(data: {
  display_name?: string;
  avatar_url?: string;
  love_language?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: data.display_name?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      love_language: data.love_language?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;
  revalidatePath('/us/profile');
  revalidatePath('/us');
  revalidatePath('/home');
}
