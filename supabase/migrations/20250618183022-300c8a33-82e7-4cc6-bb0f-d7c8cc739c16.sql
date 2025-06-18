
-- Add columns for compressed and original image URLs
ALTER TABLE public.entries 
ADD COLUMN compressed_image_url TEXT,
ADD COLUMN original_image_url TEXT;

-- Update existing entries to use cover_url as original_image_url
UPDATE public.entries 
SET original_image_url = cover_url 
WHERE cover_url IS NOT NULL;
