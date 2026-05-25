-- Run this in Supabase SQL Editor
-- Adds plan column to lesson_plans for capturing booking plan (Single / Monthly / Quarterly)

ALTER TABLE lesson_plans ADD COLUMN IF NOT EXISTS plan text;
