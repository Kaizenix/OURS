-- ============================================================
-- OURS — Migration 005: Ephemeral Disposable Rooms & Storage Updates
-- ============================================================

-- 1. Ephemeral Disposable Rooms Table (One-time / 24-hour guest chat)
CREATE TABLE IF NOT EXISTS ephemeral_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ephemeral_rooms_code ON ephemeral_rooms(room_code);

-- 2. Ephemeral Messages Table
CREATE TABLE IF NOT EXISTS ephemeral_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES ephemeral_rooms(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  is_host BOOLEAN DEFAULT false,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ephemeral_msgs_room ON ephemeral_messages(room_id, created_at ASC);

-- 3. Enable RLS
ALTER TABLE ephemeral_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ephemeral_messages ENABLE ROW LEVEL SECURITY;

-- Ephemeral rooms: Couple members can create, view, and revoke
CREATE POLICY "Public can view valid room"
  ON ephemeral_rooms FOR SELECT
  USING (is_revoked = false AND expires_at > now());

CREATE POLICY "Couple can insert room"
  ON ephemeral_rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Couple can update own room"
  ON ephemeral_rooms FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Couple can delete own room"
  ON ephemeral_rooms FOR DELETE
  USING (created_by = auth.uid());

-- Ephemeral messages: Anyone with valid room can read and insert
CREATE POLICY "Anyone can view room messages"
  ON ephemeral_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ephemeral_rooms
      WHERE ephemeral_rooms.id = ephemeral_messages.room_id
      AND ephemeral_rooms.is_revoked = false
      AND ephemeral_rooms.expires_at > now()
    )
  );

CREATE POLICY "Anyone can insert room messages"
  ON ephemeral_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ephemeral_rooms
      WHERE ephemeral_rooms.id = ephemeral_messages.room_id
      AND ephemeral_rooms.is_revoked = false
      AND ephemeral_rooms.expires_at > now()
    )
  );

-- Allow guests with active ephemeral room to view memories and media of that couple
CREATE POLICY "Ephemeral room guests can view couple memories"
  ON memories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ephemeral_rooms
      WHERE ephemeral_rooms.couple_id = memories.couple_id
      AND ephemeral_rooms.is_revoked = false
      AND ephemeral_rooms.expires_at > now()
    )
  );

CREATE POLICY "Ephemeral room guests can view couple memory media"
  ON memory_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memories
      JOIN ephemeral_rooms ON ephemeral_rooms.couple_id = memories.couple_id
      WHERE memories.id = memory_media.memory_id
      AND ephemeral_rooms.is_revoked = false
      AND ephemeral_rooms.expires_at > now()
    )
  );

-- Enable realtime for ephemeral messages
ALTER PUBLICATION supabase_realtime ADD TABLE ephemeral_messages;

-- 4. Storage Buckets & Policies (Ensures photos, avatars, and voicenotes are public & accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('photos', 'photos', true, 52428800, NULL),
  ('avatars', 'avatars', true, 10485760, NULL),
  ('chat-attachments', 'chat-attachments', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure storage objects can be read and uploaded publicly or authenticated
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public View Storage Objects" ON storage.objects;
  CREATE POLICY "Public View Storage Objects"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('photos', 'avatars', 'chat-attachments'));

  DROP POLICY IF EXISTS "Public Upload Storage Objects" ON storage.objects;
  CREATE POLICY "Public Upload Storage Objects"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('photos', 'avatars', 'chat-attachments'));

  DROP POLICY IF EXISTS "Public Update Storage Objects" ON storage.objects;
  CREATE POLICY "Public Update Storage Objects"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('photos', 'avatars', 'chat-attachments'));
END $$;
