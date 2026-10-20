'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  Profile,
  Couple,
  DailyCheckin,
  QuestionBankItem,
  DailyAnswer,
  CalendarEvent,
  LittleNote,
  MemoryWithMedia
} from '@/types/database';

export interface HomeDashboardData {
  userProfile: Profile;
  partnerProfile: Profile | null;
  couple: Couple;
  partnerCheckin: DailyCheckin | null;
  userCheckin: DailyCheckin | null;
  littleNote: LittleNote | null;
  todayQuestion: {
    id: string;
    question: QuestionBankItem;
    userAnswer: DailyAnswer | null;
    partnerAnswer: DailyAnswer | null;
    isRevealed: boolean;
  } | null;
  nextEvent: CalendarEvent | null;
  recentMemory: MemoryWithMedia | null;
  latestMessage: {
    id: string;
    sender_id: string;
    content: string | null;
    media_url: string | null;
    message_type: string;
    created_at: string;
  } | null;
  unreadCount: number;
}

export async function getHomeDashboardData(): Promise<HomeDashboardData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. User Profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) return null;

  // 2. Couple Membership
  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id, role, couples(*)')
    .eq('user_id', user.id)
    .single();

  if (!membership || !membership.couples) return null;

  const coupleId = membership.couple_id;
  const couple = (membership as unknown as { couples: Couple }).couples;

  // 3. Partner Profile
  const { data: partnerMember } = await supabase
    .from('couple_members')
    .select('user_id, profiles(*)')
    .eq('couple_id', coupleId)
    .neq('user_id', user.id)
    .maybeSingle();

  const partnerProfile = partnerMember && partnerMember.profiles
    ? ((partnerMember as unknown as { profiles: Profile }).profiles)
    : null;

  const todayStr = new Date().toISOString().split('T')[0];

  // 4. Daily Checkins for today
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('checkin_date', todayStr);

  const userCheckin = checkins?.find((c: DailyCheckin) => c.user_id === user.id) ?? null;
  const partnerCheckin = partnerProfile
    ? (checkins?.find((c: DailyCheckin) => c.user_id === partnerProfile.id) ?? null)
    : null;

  // 5. Active Little Note addressed to user
  const { data: notes } = await supabase
    .from('little_notes')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const littleNote = notes && notes.length > 0 ? notes[0] : null;

  // 6. Today's Question
  let todayQuestionData: HomeDashboardData['todayQuestion'] = null;

  // Try to find today's question for this couple
  let { data: currentDailyQ } = await supabase
    .from('daily_questions')
    .select('*, question:question_bank(*)')
    .eq('couple_id', coupleId)
    .eq('question_date', todayStr)
    .maybeSingle();

  // If no question assigned for today, assign one automatically from question_bank
  if (!currentDailyQ) {
    const { data: bankItems } = await supabase
      .from('question_bank')
      .select('*')
      .limit(100);

    if (bankItems && bankItems.length > 0) {
      // Pick deterministic question based on coupleId + date string
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
      partnerAnswer: isRevealed ? partnerAnswer : null, // Privacy: only revealed if both answered!
      isRevealed,
    };
  }

  // 7. Next Event
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('couple_id', coupleId)
    .gte('event_date', todayStr)
    .order('event_date', { ascending: true })
    .limit(1);

  const nextEvent = events && events.length > 0 ? events[0] : null;

  // 8. Recent Memory
  const { data: memories } = await supabase
    .from('memories')
    .select('*, media:memory_media(*)')
    .eq('couple_id', coupleId)
    .order('memory_date', { ascending: false })
    .limit(1);

  const recentMemory = memories && memories.length > 0
    ? (memories[0] as unknown as MemoryWithMedia)
    : null;

  // 9. Latest Chat Message & Unread Count (WhatsApp-style card in Home)
  const { data: latestMsgs } = await supabase
    .from('messages')
    .select('id, sender_id, content, media_url, message_type, created_at')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(1);

  const latestMessage = latestMsgs && latestMsgs.length > 0 ? latestMsgs[0] : null;

  let unreadCount = 0;
  if (partnerProfile) {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', coupleId)
      .eq('sender_id', partnerProfile.id)
      .eq('read', false);
    unreadCount = count || 0;
  }

  return {
    userProfile,
    partnerProfile,
    couple,
    partnerCheckin,
    userCheckin,
    littleNote,
    todayQuestion: todayQuestionData,
    nextEvent,
    recentMemory,
    latestMessage,
    unreadCount,
  };
}

export async function openNoteAction(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('little_notes')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('recipient_id', user.id);

  if (error) throw error;
}
