-- ============================================
-- Database Cleanup Script
-- ============================================
-- WARNING: This will delete ALL data and tables
-- Use this to reset the database to a clean state

-- ============================================
-- Step 1: Drop Views
-- ============================================
DROP VIEW IF EXISTS public.brand_stats CASCADE;
DROP VIEW IF EXISTS public.daily_stats CASCADE;

-- ============================================
-- Step 2: Drop Tables (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.giftcard_brands CASCADE;

-- ============================================
-- Step 3: Drop Functions
-- ============================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================
-- Step 4: Verify Cleanup
-- ============================================
-- Run this to verify all objects are removed:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
