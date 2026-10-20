-- ============================================================
-- OURS — Migration 004: Mobile Upgrades, Locket, Group Chat, Storage Policies
-- ============================================================

-- 1. STORAGE POLICIES (Ensures photos and avatars upload & display seamlessly)
DO $$
BEGIN
  -- Insert policies for storage.objects if not already created
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Photos and Avatars'
  ) THEN
    CREATE POLICY "Public Access for Photos and Avatars"
      ON storage.objects FOR SELECT
      USING (bucket_id IN ('photos', 'avatars'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Photos and Avatars'
  ) THEN
    CREATE POLICY "Authenticated Upload Photos and Avatars"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id IN ('photos', 'avatars')
        AND auth.role() = 'authenticated'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Update Photos and Avatars'
  ) THEN
    CREATE POLICY "Authenticated Update Photos and Avatars"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id IN ('photos', 'avatars')
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 2. LOCKET / INSTANT SNAP MOMENTS TABLE
CREATE TABLE IF NOT EXISTS snaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snaps_couple ON snaps(couple_id, created_at DESC);

ALTER TABLE snaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couple snaps"
  ON snaps FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can insert snaps for own couple"
  ON snaps FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can delete own snaps"
  ON snaps FOR DELETE
  USING (user_id = auth.uid());

-- 3. CHAT GROUPS & CHANNELS
CREATE TABLE IF NOT EXISTS chat_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Users',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES chat_groups(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id, created_at ASC);

ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couple chat groups"
  ON chat_groups FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can create chat groups for own couple"
  ON chat_groups FOR INSERT
  WITH CHECK (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can view own couple group messages"
  ON group_messages FOR SELECT
  USING (couple_id = get_couple_id(auth.uid()));

CREATE POLICY "Users can send group messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    couple_id = get_couple_id(auth.uid())
    AND sender_id = auth.uid()
  );

-- 4. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE snaps;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
