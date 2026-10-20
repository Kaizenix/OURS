import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_completed) redirect('/onboarding');

  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id, role, couples(*)')
    .eq('user_id', user.id)
    .single();

  if (!membership) redirect('/onboarding');

  // Get partner info
  const { data: partner } = await supabase
    .from('couple_members')
    .select('user_id, profiles(*)')
    .eq('couple_id', membership.couple_id)
    .neq('user_id', user.id)
    .single();

  return (
    <AppShell
      profile={profile}
      couple={membership.couples as unknown as Parameters<typeof AppShell>[0]['couple']}
      coupleId={membership.couple_id}
      partner={partner?.profiles as unknown as Parameters<typeof AppShell>[0]['partner']}
    >
      {children}
    </AppShell>
  );
}
