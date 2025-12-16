-- Migration: Remove all seeded/demo records from filialen table
-- This ensures the filialen page starts completely empty
-- Only authenticated admins can create new filialen via the UI

-- Delete all existing records from filialen table
-- This will cascade to related tables due to foreign key constraints
DELETE FROM filialen;

-- Add comment for future reference
COMMENT ON TABLE filialen IS 'Location/branch table - starts empty, populated only by authenticated users via UI';