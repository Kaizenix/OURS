-- ============================================================
-- OURS — Initial Database Schema
-- A private digital home for two people.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  love_language TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Couples
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  start_date DATE,
  cover_image_url TEXT,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Couple Members (junction table)
CREATE TABLE couple_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(couple_id, user_id),
  UNIQUE(user_id) -- One couple per user
);

-- Couple Invites
CREATE TABLE couple_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_couple_invites_code ON couple_invites(code);
CREATE INDEX idx_couple_invites_status ON couple_invites(status);

-- ============================================================
-- CHAT
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  reply_to UUID REFERENCES messages(id),
  image_url TEXT,
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_memory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_couple ON messages(couple_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- ============================================================
-- DAILY
-- ============================================================

CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  mood TEXT NOT NULL CHECK (mood IN ('great', 'happy', 'okay', 'tired', 'sad', 'overwhelmed', 'angry')),
  energy INT NOT NULL CHECK (energy >= 0 AND energy <= 100),
  social_battery INT NOT NULL CHECK (social_battery >= 0 AND social_battery <= 100),
  needs TEXT[] DEFAULT '{}',
  note TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX idx_checkins_couple_date ON daily_checkins(couple_id, checkin_date DESC);

CREATE TABLE question_bank (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES question_bank(id),
  question_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(couple_id, question_date)
);

CREATE TABLE daily_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(daily_question_id, user_id)
);

-- ============================================================
-- MEMORIES
-- ============================================================

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT,
  memory_date DATE,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memories_couple ON memories(couple_id, memory_date DESC);

CREATE TABLE memory_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MILESTONES
-- ============================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  icon TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_milestones_couple ON milestones(couple_id, milestone_date);

-- ============================================================
-- GOALS
-- ============================================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('travel', 'food', 'relationship', 'finance', 'personal', 'adventure', 'home', 'random')),
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'someday' CHECK (status IN ('someday', 'planning', 'in_progress', 'completed')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goals_couple ON goals(couple_id, status);

CREATE TABLE goal_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DATE PLANNER
-- ============================================================

CREATE TABLE date_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  planned_date DATE,
  planned_time TIME,
  location TEXT,
  budget TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'planned', 'done')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_date_plans_couple ON date_plans(couple_id, status);

CREATE TABLE date_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_plan_id UUID NOT NULL REFERENCES date_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date_plan_id, user_id)
);

-- ============================================================
-- CALENDAR
-- ============================================================

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('anniversary', 'birthday', 'date', 'trip', 'milestone', 'custom')),
  event_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('yearly', 'monthly')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_calendar_couple ON calendar_events(couple_id, event_date);

-- ============================================================
-- LITTLE NOTES
-- ============================================================

CREATE TABLE little_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  open_condition TEXT NOT NULL DEFAULT 'now' CHECK (open_condition IN ('now', 'date', 'whenever')),
  open_date TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notes_recipient ON little_notes(recipient_id, opened_at);

-- ============================================================
-- JOURNAL
-- ============================================================

CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  visibility TEXT NOT NULL DEFAULT 'shared' CHECK (visibility IN ('shared', 'private')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journals_couple ON journals(couple_id, created_at DESC);
CREATE INDEX idx_journals_user ON journals(user_id, visibility);

-- ============================================================
-- TALK SPACE
-- ============================================================

CREATE TABLE talk_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES profiles(id),
  topic TEXT NOT NULL,
  perspective TEXT,
  feeling TEXT,
  need TEXT,
  desired_outcome TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'discussed', 'resolved')),
  partner_ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get the couple_id for a given user
CREATE OR REPLACE FUNCTION get_couple_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT couple_id FROM couple_members WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if two users are in the same couple
CREATE OR REPLACE FUNCTION is_couple_partner(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM couple_members cm1
    JOIN couple_members cm2 ON cm1.couple_id = cm2.couple_id
    WHERE cm1.user_id = user_a AND cm2.user_id = user_b
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the partner's user_id
CREATE OR REPLACE FUNCTION get_partner_id(user_uuid UUID)
RETURNS UUID AS $$
  SELECT cm2.user_id FROM couple_members cm1
  JOIN couple_members cm2 ON cm1.couple_id = cm2.couple_id
  WHERE cm1.user_id = user_uuid AND cm2.user_id != user_uuid
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE little_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE talk_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: profiles
-- ============================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view partner profile"
  ON profiles FOR SELECT
  USING (is_couple_partner(auth.uid(), id));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- RLS POLICIES: couples
-- ============================================================

CREATE POLICY "Users can view own couple"
  ON couples FOR SELECT
  USING (id = get_couple_id(auth.uid()));

CREATE POLICY "Authenticated users can create couple"
  ON couples FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Couple members can update couple"
  ON couples FOR UPDATE
  USING (id = get_couple_id(auth.uid()));

-- ============================================================
-- RLS POLICIES: couple_members
-- ============================================================

CREATE POLICY "Users can view own couple members"
  ON couple_members FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Authenticated users can insert couple member"
  ON couple_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- RLS POLICIES: couple_invites
-- ============================================================

CREATE POLICY "Users can view own couple invites"
  ON couple_invites FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()) OR status = 'pending');

CREATE POLICY "Users can create invites for own couple"
  ON couple_invites FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own couple invites"
  ON couple_invites FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()) OR status = 'pending');

-- ============================================================
-- RLS POLICIES: messages
-- ============================================================

CREATE POLICY "Users can view own couple messages"
  ON messages FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can send messages to own couple"
  ON messages FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can soft-delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- ============================================================
-- RLS POLICIES: message_reactions
-- ============================================================

CREATE POLICY "Users can view reactions in own couple"
  ON message_reactions FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can add reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: daily_checkins
-- ============================================================

CREATE POLICY "Users can view own couple checkins"
  ON daily_checkins FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create own checkin"
  ON daily_checkins FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND couple_id = get_couple_id(auth.uid())
  );

CREATE POLICY "Users can update own checkin"
  ON daily_checkins FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: question_bank (read-only for all authenticated)
-- ============================================================

CREATE POLICY "Authenticated users can read question bank"
  ON question_bank FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- RLS POLICIES: daily_questions
-- ============================================================

CREATE POLICY "Users can view own couple questions"
  ON daily_questions FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create daily question for own couple"
  ON daily_questions FOR INSERT
  WITH CHECK (couple_id = get_couple_id(auth.uid()));

-- ============================================================
-- RLS POLICIES: daily_answers
-- ============================================================

CREATE POLICY "Users can view own couple answers"
  ON daily_answers FOR SELECT
  USING (
    daily_question_id IN (
      SELECT id FROM daily_questions WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can submit own answer"
  ON daily_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own answer"
  ON daily_answers FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: memories
-- ============================================================

CREATE POLICY "Users can view own couple memories"
  ON memories FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create memories for own couple"
  ON memories FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own couple memories"
  ON memories FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Creator can delete memory"
  ON memories FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- RLS POLICIES: memory_media
-- ============================================================

CREATE POLICY "Users can view own couple memory media"
  ON memory_media FOR SELECT
  USING (
    memory_id IN (
      SELECT id FROM memories WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can add media to own couple memories"
  ON memory_media FOR INSERT
  WITH CHECK (
    memory_id IN (
      SELECT id FROM memories WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete own couple memory media"
  ON memory_media FOR DELETE
  USING (
    memory_id IN (
      SELECT id FROM memories WHERE couple_id = get_couple_id(auth.uid())
    )
  );

-- ============================================================
-- RLS POLICIES: milestones
-- ============================================================

CREATE POLICY "Users can view own couple milestones"
  ON milestones FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create milestones for own couple"
  ON milestones FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own couple milestones"
  ON milestones FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Creator can delete milestone"
  ON milestones FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- RLS POLICIES: goals
-- ============================================================

CREATE POLICY "Users can view own couple goals"
  ON goals FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create goals for own couple"
  ON goals FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own couple goals"
  ON goals FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Creator can delete goal"
  ON goals FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- RLS POLICIES: goal_tasks
-- ============================================================

CREATE POLICY "Users can view own couple goal tasks"
  ON goal_tasks FOR SELECT
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can create tasks for own couple goals"
  ON goal_tasks FOR INSERT
  WITH CHECK (
    goal_id IN (
      SELECT id FROM goals WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can update own couple goal tasks"
  ON goal_tasks FOR UPDATE
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can delete own couple goal tasks"
  ON goal_tasks FOR DELETE
  USING (
    goal_id IN (
      SELECT id FROM goals WHERE couple_id = get_couple_id(auth.uid())
    )
  );

-- ============================================================
-- RLS POLICIES: date_plans
-- ============================================================

CREATE POLICY "Users can view own couple date plans"
  ON date_plans FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create date plans for own couple"
  ON date_plans FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own couple date plans"
  ON date_plans FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Creator can delete date plan"
  ON date_plans FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- RLS POLICIES: date_votes
-- ============================================================

CREATE POLICY "Users can view own couple date votes"
  ON date_votes FOR SELECT
  USING (
    date_plan_id IN (
      SELECT id FROM date_plans WHERE couple_id = get_couple_id(auth.uid())
    )
  );

CREATE POLICY "Users can vote on own couple dates"
  ON date_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vote"
  ON date_votes FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: calendar_events
-- ============================================================

CREATE POLICY "Users can view own couple events"
  ON calendar_events FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create events for own couple"
  ON calendar_events FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own couple events"
  ON calendar_events FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Creator can delete event"
  ON calendar_events FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- RLS POLICIES: little_notes
-- ============================================================

CREATE POLICY "Recipient and sender can view notes"
  ON little_notes FOR SELECT
  USING (
    couple_id = get_couple_id(auth.uid())
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

CREATE POLICY "Users can create notes for partner"
  ON little_notes FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND couple_id = get_couple_id(auth.uid())
  );

CREATE POLICY "Recipient can update note (open it)"
  ON little_notes FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "Sender can delete own note"
  ON little_notes FOR DELETE
  USING (sender_id = auth.uid());

-- ============================================================
-- RLS POLICIES: journals
-- ============================================================

-- Shared journals: both can see
CREATE POLICY "Users can view shared journals in couple"
  ON journals FOR SELECT
  USING (
    couple_id = get_couple_id(auth.uid())
    AND visibility = 'shared'
  );

-- Private journals: only creator
CREATE POLICY "Users can view own private journals"
  ON journals FOR SELECT
  USING (
    user_id = auth.uid()
    AND visibility = 'private'
  );

CREATE POLICY "Users can create journals"
  ON journals FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND couple_id = get_couple_id(auth.uid())
  );

CREATE POLICY "Users can update own journals"
  ON journals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own journals"
  ON journals FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: talk_topics
-- ============================================================

CREATE POLICY "Users can view own couple talk topics"
  ON talk_topics FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create talk topics for own couple"
  ON talk_topics FOR INSERT
  WITH CHECK (
    initiator_id = auth.uid()
    AND couple_id = get_couple_id(auth.uid())
  );

CREATE POLICY "Users can update own couple talk topics"
  ON talk_topics FOR UPDATE
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Initiator can delete talk topic"
  ON talk_topics FOR DELETE
  USING (initiator_id = auth.uid());

-- ============================================================
-- RLS POLICIES: notifications
-- ============================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- TRIGGERS: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON daily_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON daily_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON date_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON talk_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REALTIME: enable for chat
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_checkins;
