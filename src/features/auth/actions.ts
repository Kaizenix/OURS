'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function updateProfile(data: { display_name: string; avatar_url?: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...data,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
  }
}

export async function createCoupleSpace() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if already in a couple
    const { data: existing } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Fetch existing invite code
      const { data: invite } = await supabase
        .from('couple_invites')
        .select('code')
        .eq('couple_id', existing.couple_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        success: true,
        coupleId: existing.couple_id,
        code: invite?.code ?? null,
        alreadyPaired: true
      };
    }

    // Pre-generate UUID for the new couple space to avoid SELECT RLS rejection before member creation
    const coupleId = crypto.randomUUID();

    // 1. Create couple row
    const { error: coupleError } = await supabase
      .from('couples')
      .insert({
        id: coupleId,
        name: 'Our Space',
      });
    if (coupleError) {
      console.error('Error creating couple:', coupleError);
      return { success: false, error: coupleError.message || 'Failed to create couple space' };
    }

    // 2. Add creator as member
    const { error: memberError } = await supabase
      .from('couple_members')
      .insert({
        couple_id: coupleId,
        user_id: user.id,
        role: 'creator',
      });
    if (memberError) {
      console.error('Error adding couple member:', memberError);
      return { success: false, error: memberError.message || 'Failed to add creator as member' };
    }

    // 3. Generate invite code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = 'OURS-' + Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');

    const { error: inviteError } = await supabase
      .from('couple_invites')
      .insert({
        couple_id: coupleId,
        code,
        created_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return { success: false, error: inviteError.message || 'Failed to generate invite code' };
    }

    return { success: true, coupleId, code, alreadyPaired: false };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create space' };
  }
}

export async function joinCoupleSpace(inviteCode: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if already in a couple
    const { data: existing } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return { success: false, error: 'You are already in a couple space' };

    // Find invite
    const { data: invite, error: findError } = await supabase
      .from('couple_invites')
      .select('*')
      .eq('code', inviteCode.toUpperCase().trim())
      .eq('status', 'pending')
      .maybeSingle();

    if (findError || !invite) return { success: false, error: 'Invalid or expired invite code' };
    if (new Date(invite.expires_at) < new Date()) return { success: false, error: 'This invite code has expired' };
    if (invite.created_by === user.id) return { success: false, error: 'You cannot join your own space' };

    // Add as member
    const { error: memberError } = await supabase
      .from('couple_members')
      .insert({ couple_id: invite.couple_id, user_id: user.id, role: 'member' });
    if (memberError) {
      console.error('Error joining couple space:', memberError);
      return { success: false, error: memberError.message || 'Failed to join space' };
    }

    // Mark invite as used
    await supabase
      .from('couple_invites')
      .update({ status: 'used', used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', invite.id);

    return { success: true, coupleId: invite.couple_id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to join space' };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
