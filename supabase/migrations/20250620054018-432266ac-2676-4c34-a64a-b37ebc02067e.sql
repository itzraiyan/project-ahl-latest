
-- Add support for multiple sources by changing source to an array
ALTER TABLE public.entries 
DROP COLUMN IF EXISTS source CASCADE;

ALTER TABLE public.entries 
ADD COLUMN sources TEXT[] DEFAULT '{}';

-- Ensure all existing columns are properly set up
ALTER TABLE public.entries 
ALTER COLUMN rating TYPE DECIMAL(3,1);

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_entries_status ON public.entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_updated_at ON public.entries(updated_at DESC);
