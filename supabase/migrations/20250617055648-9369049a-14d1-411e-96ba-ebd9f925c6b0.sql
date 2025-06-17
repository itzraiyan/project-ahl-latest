
-- Add new columns to the entries table for chapter tracking and dates
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS total_chapters INTEGER,
ADD COLUMN IF NOT EXISTS chapters_read INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
