-- Run this in Supabase SQL Editor
-- Makes lesson_plans support public booking requests (draft state)

ALTER TABLE lesson_plans ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE lesson_plans ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE lesson_plans ALTER COLUMN booking_date DROP NOT NULL;
ALTER TABLE lesson_plans ALTER COLUMN booking_time DROP NOT NULL;

ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS requester_name text;
ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS requester_whatsapp text;
ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS preferred_date text;
ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS preferred_time text;

-- Allow public (unauthenticated) inserts for booking requests
CREATE POLICY "public can insert draft bookings" ON lesson_plans
  FOR INSERT WITH CHECK (status = 'draft' AND teacher_id IS NULL);
