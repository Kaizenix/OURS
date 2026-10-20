'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  DailyCheckin,
  QuestionBankItem,
  DailyAnswer,
  Profile,
  MoodType,
  NeedType,
} from '@/types/database';

export interface DailyPageData {
  userProfile: Profile;
  partnerProfile: Profile | null;
  coupleId: string;
  userCheckin: DailyCheckin | null;
  partnerCheckin: DailyCheckin | null;
  todayQuestion: {
    id: string;
    question: QuestionBankItem;
    userAnswer: DailyAnswer | null;
    partnerAnswer: DailyAnswer | null;
    isRevealed: boolean;
  } | null;
}

export async function getDailyPageData(): Promise<DailyPageData | null> {
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
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) return null;
  const coupleId = membership.couple_id;

  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id, profiles(*)')
    .eq('couple_id', coupleId)
    .neq('user_id', user.id)
    .maybeSingle();

  const partnerProfile = partnerMember && partnerMember.profiles
    ? (partnerMember as unknown as { profiles: Profile }).profiles
    : null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily checkins
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('checkin_date', todayStr);

  const userCheckin = checkins?.find((c: DailyCheckin) => c.user_id === user.id) ?? null;
  const partnerCheckin = partnerProfile
    ? (checkins?.find((c: DailyCheckin) => c.user_id === partnerProfile.id) ?? null)
    : null;

  // Daily Question
  let { data: currentDailyQ } = await supabase
    .from('daily_questions')
    .select('*, question:question_bank(*)')
    .eq('couple_id', coupleId)
    .eq('question_date', todayStr)
    .maybeSingle();

  if (!currentDailyQ) {
    const { data: bankItems } = await supabase
      .from('question_bank')
      .select('*')
      .limit(100);

    if (bankItems && bankItems.length > 0) {
      const dateHash = todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
      const chosen = bankItems[dateHash % bankItems.length];

      const { data: newQ } = await supabase
        .from('daily_questions')
        .insert({
          couple_id: coupleId,
          question_id: chosen.id,
          question_date: todayStr,
        })
        .select('*, question:question_bank(*)')
        .single();

      currentDailyQ = newQ;
    }
  }

  let todayQuestionData: DailyPageData['todayQuestion'] = null;

  if (currentDailyQ) {
    const { data: answers } = await supabase
      .from('daily_answers')
      .select('*')
      .eq('daily_question_id', currentDailyQ.id);

    const userAnswer = answers?.find((a: DailyAnswer) => a.user_id === user.id) ?? null;
    const partnerAnswer = partnerProfile
      ? (answers?.find((a: DailyAnswer) => a.user_id === partnerProfile.id) ?? null)
      : null;

    const isRevealed = Boolean(userAnswer && partnerAnswer);

    todayQuestionData = {
      id: currentDailyQ.id,
      question: (currentDailyQ as unknown as { question: QuestionBankItem }).question,
      userAnswer,
      partnerAnswer: isRevealed ? partnerAnswer : null, // Partner answer hidden until both submit!
      isRevealed,
    };
  }

  return {
    userProfile,
    partnerProfile,
    coupleId,
    userCheckin,
    partnerCheckin,
    todayQuestion: todayQuestionData,
  };
}

export async function submitCheckinAction(data: {
  mood: MoodType;
  energy: number;
  social_battery: number;
  needs: NeedType[];
  note?: string;
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

  const todayStr = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('daily_checkins')
    .upsert(
      {
        couple_id: membership.couple_id,
        user_id: user.id,
        mood: data.mood,
        energy: data.energy,
        social_battery: data.social_battery,
        needs: data.needs,
        note: data.note || null,
        checkin_date: todayStr,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,checkin_date' }
    );

  if (error) throw error;
  revalidatePath('/daily');
  revalidatePath('/home');
}

export async function submitDailyAnswerAction(dailyQuestionId: string, answer: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!answer.trim()) throw new Error('Answer cannot be empty');

  const { error } = await supabase
    .from('daily_answers')
    .upsert(
      {
        daily_question_id: dailyQuestionId,
        user_id: user.id,
        answer: answer.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'daily_question_id,user_id' }
    );

  if (error) throw error;
  revalidatePath('/daily');
  revalidatePath('/home');
}
