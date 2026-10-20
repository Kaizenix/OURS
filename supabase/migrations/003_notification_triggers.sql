-- ============================================================
-- OURS — Automated In-App Notification Triggers
-- ============================================================

-- Helper function to get partner user_id
CREATE OR REPLACE FUNCTION get_partner_id(p_couple_id UUID, p_user_id UUID)
RETURNS UUID AS $$
  SELECT user_id 
  FROM couple_members 
  WHERE couple_id = p_couple_id AND user_id != p_user_id
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Trigger for Daily Check-in
CREATE OR REPLACE FUNCTION notify_on_checkin()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_id UUID;
  v_sender_name TEXT;
BEGIN
  v_partner_id := get_partner_id(NEW.couple_id, NEW.user_id);
  IF v_partner_id IS NOT NULL THEN
    SELECT display_name INTO v_sender_name FROM profiles WHERE id = NEW.user_id;
    IF v_sender_name IS NULL THEN v_sender_name := 'Your partner'; END IF;

    INSERT INTO notifications (couple_id, user_id, title, body, type)
    VALUES (
      NEW.couple_id,
      v_partner_id,
      v_sender_name || ' checked in today',
      'Mood: ' || INITCAP(NEW.mood) || '. Tap to see their energy and needs.',
      'checkin'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_checkin ON daily_checkins;
CREATE TRIGGER trg_notify_checkin
AFTER INSERT OR UPDATE ON daily_checkins
FOR EACH ROW EXECUTE FUNCTION notify_on_checkin();

-- 2. Trigger for Daily Answer
CREATE OR REPLACE FUNCTION notify_on_daily_answer()
RETURNS TRIGGER AS $$
DECLARE
  v_couple_id UUID;
  v_partner_id UUID;
  v_sender_name TEXT;
  v_answer_count INT;
BEGIN
  SELECT couple_id INTO v_couple_id FROM daily_questions WHERE id = NEW.daily_question_id;
  v_partner_id := get_partner_id(v_couple_id, NEW.user_id);
  
  IF v_partner_id IS NOT NULL THEN
    SELECT display_name INTO v_sender_name FROM profiles WHERE id = NEW.user_id;
    IF v_sender_name IS NULL THEN v_sender_name := 'Your partner'; END IF;

    SELECT COUNT(*) INTO v_answer_count FROM daily_answers WHERE daily_question_id = NEW.daily_question_id;

    IF v_answer_count = 1 THEN
      -- Only this user answered so far
      INSERT INTO notifications (couple_id, user_id, title, body, type)
      VALUES (
        v_couple_id,
        v_partner_id,
        v_sender_name || ' answered today''s question',
        'Submit your answer to unlock what they wrote!',
        'daily_question'
      );
    ELSIF v_answer_count >= 2 THEN
      -- Both answered! Notify both
      INSERT INTO notifications (couple_id, user_id, title, body, type)
      VALUES 
        (v_couple_id, NEW.user_id, 'Both answered!', 'Today''s answers are unlocked. Tap to reveal!', 'daily_question'),
        (v_couple_id, v_partner_id, 'Both answered!', 'Today''s answers are unlocked. Tap to reveal!', 'daily_question');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_daily_answer ON daily_answers;
CREATE TRIGGER trg_notify_daily_answer
AFTER INSERT ON daily_answers
FOR EACH ROW EXECUTE FUNCTION notify_on_daily_answer();

-- 3. Trigger for Little Notes
CREATE OR REPLACE FUNCTION notify_on_little_note()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  SELECT display_name INTO v_sender_name FROM profiles WHERE id = NEW.sender_id;
  IF v_sender_name IS NULL THEN v_sender_name := 'Your partner'; END IF;

  INSERT INTO notifications (couple_id, user_id, title, body, type)
  VALUES (
    NEW.couple_id,
    NEW.recipient_id,
    v_sender_name || ' left you a sealed note',
    '"' || NEW.title || '"',
    'little_note'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_little_note ON little_notes;
CREATE TRIGGER trg_notify_little_note
AFTER INSERT ON little_notes
FOR EACH ROW EXECUTE FUNCTION notify_on_little_note();

-- 4. Trigger for Memories
CREATE OR REPLACE FUNCTION notify_on_memory()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_id UUID;
  v_sender_name TEXT;
BEGIN
  v_partner_id := get_partner_id(NEW.couple_id, NEW.created_by);
  IF v_partner_id IS NOT NULL THEN
    SELECT display_name INTO v_sender_name FROM profiles WHERE id = NEW.created_by;
    IF v_sender_name IS NULL THEN v_sender_name := 'Your partner'; END IF;

    INSERT INTO notifications (couple_id, user_id, title, body, type)
    VALUES (
      NEW.couple_id,
      v_partner_id,
      'A new memory was saved',
      v_sender_name || ' added "' || NEW.title || '" to your scrapbook.',
      'memory'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_memory ON memories;
CREATE TRIGGER trg_notify_memory
AFTER INSERT ON memories
FOR EACH ROW EXECUTE FUNCTION notify_on_memory();

-- 5. Trigger for Talk Space
CREATE OR REPLACE FUNCTION notify_on_talk_topic()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_id UUID;
  v_sender_name TEXT;
BEGIN
  v_partner_id := get_partner_id(NEW.couple_id, NEW.initiator_id);
  IF v_partner_id IS NOT NULL THEN
    SELECT display_name INTO v_sender_name FROM profiles WHERE id = NEW.initiator_id;
    IF v_sender_name IS NULL THEN v_sender_name := 'Your partner'; END IF;

    INSERT INTO notifications (couple_id, user_id, title, body, type)
    VALUES (
      NEW.couple_id,
      v_partner_id,
      v_sender_name || ' wants to talk about something',
      'Topic: "' || NEW.topic || '". Take a look whenever you feel ready.',
      'talk_topic'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_talk_topic ON talk_topics;
CREATE TRIGGER trg_notify_talk_topic
AFTER INSERT ON talk_topics
FOR EACH ROW EXECUTE FUNCTION notify_on_talk_topic();
