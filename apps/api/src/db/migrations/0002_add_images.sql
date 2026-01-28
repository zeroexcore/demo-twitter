-- Add images column to tweets table
-- Stores JSON array of image URLs
ALTER TABLE tweets ADD COLUMN images TEXT DEFAULT '[]';
