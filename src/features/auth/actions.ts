'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updateProfile(data: { display_name: string; avatar_url?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw error;
}

export async function createCoupleSpace() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already in a couple
  const { data: existing } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Fetch existing invite code
    const { data: invite } = await supabase
      .from('couple_invites')
      .select('code')
      .eq('couple_id', existing.couple_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { coupleId: existing.couple_id, code: invite?.code ?? null, alreadyPaired: true };
  }

  // Create couple
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .insert({})
    .select()
    .single();
  if (coupleError) throw coupleError;

  // Add creator as member
  const { error: memberError } = await supabase
    .from('couple_members')
    .insert({ couple_id: couple.id, user_id: user.id, role: 'creator' });
  if (memberError) throw memberError;

  // Generate invite code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = 'OURS-' + Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const { error: inviteError } = await supabase
    .from('couple_invites')
    .insert({
      couple_id: couple.id,
      code,
      created_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  if (inviteError) throw inviteError;

  return { coupleId: couple.id, code, alreadyPaired: false };
}

export async function joinCoupleSpace(inviteCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already in a couple
  const { data: existing } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (existing) throw new Error('You are already in a couple space');

  // Find invite
  const { data: invite, error: findError } = await supabase
    .from('couple_invites')
    .select('*')
    .eq('code', inviteCode.toUpperCase().trim())
    .eq('status', 'pending')
    .single();

  if (findError || !invite) throw new Error('Invalid or expired invite code');
  if (new Date(invite.expires_at) < new Date()) throw new Error('This invite code has expired');
  if (invite.created_by === user.id) throw new Error('You cannot join your own space');

  // Add as member
  const { error: memberError } = await supabase
    .from('couple_members')
    .insert({ couple_id: invite.couple_id, user_id: user.id, role: 'member' });
  if (memberError) throw memberError;

  // Mark invite as used
  await supabase
    .from('couple_invites')
    .update({ status: 'used', used_by: user.id, used_at: new Date().toISOString() })
    .eq('id', invite.id);

  return { coupleId: invite.couple_id };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
