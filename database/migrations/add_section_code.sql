-- Migration: Add section_code column to course_sections table
-- Date: 2026-02-07
-- Description: Adds a unique section_code column to identify course sections

-- Add section_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_sections' 
        AND column_name = 'section_code'
    ) THEN
        ALTER TABLE course_sections 
        ADD COLUMN section_code VARCHAR(50) UNIQUE NOT NULL;
    END IF;
END $$;
