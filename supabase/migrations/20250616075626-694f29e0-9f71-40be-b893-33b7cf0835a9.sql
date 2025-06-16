
-- Create a table for entries
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  tags TEXT[],
  status TEXT NOT NULL CHECK (status IN ('Plan to Read', 'Reading', 'Paused', 'Completed', 'Dropped', 'Rereading')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  release_date DATE,
  synopsis TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to view entries (read-only for public)
CREATE POLICY "Anyone can view entries" 
  ON public.entries 
  FOR SELECT 
  TO public
  USING (true);

-- Create a policy that only allows authenticated users to insert entries
CREATE POLICY "Only authenticated users can create entries" 
  ON public.entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create a policy that only allows authenticated users to update entries
CREATE POLICY "Only authenticated users can update entries" 
  ON public.entries 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create a policy that only allows authenticated users to delete entries
CREATE POLICY "Only authenticated users can delete entries" 
  ON public.entries 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO public.entries (title, author, cover_url, tags, status, rating, notes, release_date, synopsis, source) VALUES
('Sample Doujinshi #1', 'Artist Name', '/placeholder.svg', ARRAY['romance', 'comedy', 'slice of life'], 'Completed', 8, 'Really enjoyed this one!', '2024-01-15', 'A heartwarming story about...', 'nhentai'),
('Another Great Work', 'Another Artist', '/placeholder.svg', ARRAY['drama', 'supernatural'], 'Reading', 7, '', '2024-02-01', '', 'DLsite'),
('Plan to Read This', 'Future Author', '/placeholder.svg', ARRAY['action', 'adventure'], 'Plan to Read', NULL, '', '2024-03-01', '', 'Pixiv');
