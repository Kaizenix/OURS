// ============================================================
// OURS — Database TypeScript Types
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MoodType = 'great' | 'happy' | 'okay' | 'tired' | 'sad' | 'overwhelmed' | 'angry';

export type NeedType =
  | 'attention'
  | 'space'
  | 'reassurance'
  | 'affection'
  | 'quality_time'
  | 'help'
  | 'just_listen'
  | 'nothing_specific';

export type GoalStatus = 'someday' | 'planning' | 'in_progress' | 'completed';

export type GoalCategory =
  | 'travel'
  | 'food'
  | 'relationship'
  | 'finance'
  | 'personal'
  | 'adventure'
  | 'home'
  | 'random';

export type DatePlanStatus = 'idea' | 'planned' | 'done';

export type EventType = 'anniversary' | 'birthday' | 'date' | 'trip' | 'milestone' | 'custom';

export type NoteCondition = 'now' | 'date' | 'whenever';

export type JournalVisibility = 'shared' | 'private';

export type TalkTopicStatus = 'pending' | 'ready' | 'discussed' | 'resolved';

export type InviteStatus = 'pending' | 'used' | 'expired';

export type CoupleRole = 'creator' | 'member';

export type QuestionCategory =
  | 'getting_to_know'
  | 'love'
  | 'communication'
  | 'future'
  | 'memory'
  | 'intimacy'
  | 'fun'
  | 'values'
  | 'relationship'
  | 'conflict'
  | 'goals'
  | 'personal_growth';

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  love_language: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string;
  name: string | null;
  start_date: string | null;
  cover_image_url: string | null;
  quote: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoupleMember {
  id: string;
  couple_id: string;
  user_id: string;
  role: CoupleRole;
  joined_at: string;
}

export interface CoupleInvite {
  id: string;
  couple_id: string;
  code: string;
  created_by: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  status: InviteStatus;
  created_at: string;
}

export interface Message {
  id: string;
  couple_id: string;
  sender_id: string;
  content: string | null;
  reply_to: string | null;
  image_url: string | null;
  is_edited: boolean;
  is_pinned: boolean;
  is_memory: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface DailyCheckin {
  id: string;
  couple_id: string;
  user_id: string;
  mood: MoodType;
  energy: number;
  social_battery: number;
  needs: NeedType[];
  note: string | null;
  checkin_date: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankItem {
  id: number;
  question: string;
  category: QuestionCategory;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  couple_id: string;
  question_id: number;
  question_date: string;
  created_at: string;
}

export interface DailyAnswer {
  id: string;
  daily_question_id: string;
  user_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  couple_id: string;
  title: string;
  story: string | null;
  memory_date: string | null;
  location: string | null;
  tags: string[];
  is_favorite: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryMedia {
  id: string;
  memory_id: string;
  url: string;
  media_type: string;
  sort_order: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  milestone_date: string;
  icon: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_date: string | null;
  status: GoalStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GoalTask {
  id: string;
  goal_id: string;
  title: string;
  is_completed: boolean;
  completed_by: string | null;
  created_at: string;
}

export interface DatePlan {
  id: string;
  couple_id: string;
  title: string;
  planned_date: string | null;
  planned_time: string | null;
  location: string | null;
  budget: string | null;
  notes: string | null;
  status: DatePlanStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DateVote {
  id: string;
  date_plan_id: string;
  user_id: string;
  vote: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  couple_id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  is_recurring: boolean;
  recurrence_type: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LittleNote {
  id: string;
  couple_id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  content: string;
  open_condition: NoteCondition;
  open_date: string | null;
  opened_at: string | null;
  created_at: string;
}

export interface Journal {
  id: string;
  couple_id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string | null;
  visibility: JournalVisibility;
  created_at: string;
  updated_at: string;
}

export interface TalkTopic {
  id: string;
  couple_id: string;
  initiator_id: string;
  topic: string;
  perspective: string | null;
  feeling: string | null;
  need: string | null;
  desired_outcome: string | null;
  status: TalkTopicStatus;
  partner_ready_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  couple_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Json | null;
  is_read: boolean;
  created_at: string;
}

// ============================================================
// Joined / Extended Types
// ============================================================

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'display_name' | 'avatar_url'>;
  reactions: MessageReaction[];
  reply_message?: Pick<Message, 'id' | 'content' | 'sender_id'> & {
    sender: Pick<Profile, 'display_name'>;
  };
}

export interface DailyQuestionWithDetails extends DailyQuestion {
  question: QuestionBankItem;
  answers: (DailyAnswer & { user: Pick<Profile, 'display_name' | 'avatar_url'> })[];
}

export interface MemoryWithMedia extends Memory {
  media: MemoryMedia[];
}

export interface GoalWithTasks extends Goal {
  tasks: GoalTask[];
}

export interface CoupleWithMembers extends Couple {
  members: (CoupleMember & { profile: Profile })[];
}
