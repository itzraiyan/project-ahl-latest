
-- Remove the release_date column from the entries table
ALTER TABLE public.entries DROP COLUMN IF EXISTS release_date;
