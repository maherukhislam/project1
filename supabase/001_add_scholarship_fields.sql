-- Migration: Add production scholarship logic fields
-- Run this in the Supabase SQL editor

ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS funding_percentage numeric(5,2),
  ADD COLUMN IF NOT EXISTS study_level        text,
  ADD COLUMN IF NOT EXISTS intake             text DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS application_type   text NOT NULL DEFAULT 'manual'
                                              CHECK (application_type IN ('auto', 'manual')),
  ADD COLUMN IF NOT EXISTS additional_requirements text,
  ADD COLUMN IF NOT EXISTS is_stackable       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS merit_based        boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS need_based         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_active          boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS min_english_score  numeric(4,1),
  ADD COLUMN IF NOT EXISTS english_test_type  text,
  ADD COLUMN IF NOT EXISTS gpa_tolerance      numeric(3,2) DEFAULT 0.2;

-- Index for common filters
CREATE INDEX IF NOT EXISTS idx_scholarships_active    ON public.scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_featured  ON public.scholarships(is_featured);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline  ON public.scholarships(deadline);
