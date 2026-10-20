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

  // Get partner info directly
  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', membership.couple_id)
    .neq('user_id', user.id)
    .maybeSingle();

  let partner: Parameters<typeof AppShell>[0]['partner'] = null;
  if (partnerMember?.user_id) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerMember.user_id)
      .maybeSingle();
    partner = p as Parameters<typeof AppShell>[0]['partner'];
  }

  // Daily login modal data
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('couple_id', membership.couple_id)
    .eq('user_id', user.id)
    .eq('checkin_date', todayStr)
    .maybeSingle();

  const { data: dailyQ } = await supabase
    .from('daily_questions')
    .select('id, question:question_bank(*)')
    .eq('couple_id', membership.couple_id)
    .eq('question_date', todayStr)
    .maybeSingle();

  let userAnswer = null;
  if (dailyQ) {
    const { data: ans } = await supabase
      .from('daily_answers')
      .select('*')
      .eq('daily_question_id', dailyQ.id)
      .eq('user_id', user.id)
      .maybeSingle();
    userAnswer = ans;
  }

  const dailyLoginData = {
    hasCheckedInToday: !!checkin,
    todayQuestion: dailyQ ? {
      id: dailyQ.id,
      question: (dailyQ as any).question,
      userAnswer,
    } : null,
  };

  return (
    <AppShell
      profile={profile}
      couple={membership.couples as unknown as Parameters<typeof AppShell>[0]['couple']}
      coupleId={membership.couple_id}
      partner={partner}
      dailyLoginData={dailyLoginData}
    >
      {children}
    </AppShell>
  );
}
