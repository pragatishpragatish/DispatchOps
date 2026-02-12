-- Migration: Make owner_rate nullable in trips table
-- This allows trips to be created without owner_rate for coordination fee model
-- Run this migration in your Supabase SQL Editor

-- First, drop the generated column constraint on margin_amount since we're not using it
-- Then make owner_rate nullable

-- Drop the generated column (we'll recreate it as nullable if needed, or remove it)
ALTER TABLE trips DROP COLUMN IF EXISTS margin_amount;

-- Make owner_rate nullable
ALTER TABLE trips ALTER COLUMN owner_rate DROP NOT NULL;

-- Optionally, add margin_amount back as a nullable column (not generated) if you want to track it
-- But since we're using coordination fee model, we can leave it out
-- ALTER TABLE trips ADD COLUMN margin_amount DECIMAL(10, 2);
