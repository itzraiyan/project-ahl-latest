
-- Add total_repeats column to track rereading sessions
ALTER TABLE public.entries 
ADD COLUMN total_repeats INTEGER DEFAULT 0;
