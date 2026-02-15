-- Add description column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing rows to have an empty description instead of NULL
UPDATE public.projects 
SET description = '' 
WHERE description IS NULL;
