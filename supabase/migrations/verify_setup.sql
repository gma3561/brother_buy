-- ============================================
-- Database Setup Verification Script
-- ============================================
-- Run this AFTER completing both cleanup and init steps
-- This will show you if everything is set up correctly

-- 1. Check Tables Exist
SELECT
    'Tables Check' as check_type,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 3 THEN '✅ PASS: All 3 tables exist'
        ELSE '❌ FAIL: Expected 3 tables, found ' || COUNT(*)
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('giftcard_brands', 'purchase_requests', 'transactions');

-- 2. Check Brand Data
SELECT
    'Brand Data Check' as check_type,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 8 THEN '✅ PASS: All 8 brands loaded'
        ELSE '❌ FAIL: Expected 8 brands, found ' || COUNT(*)
    END as status
FROM giftcard_brands;

-- 3. Check Critical Columns in purchase_requests
SELECT
    'Column Check' as check_type,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 18 THEN '✅ PASS: All columns exist'
        ELSE '❌ FAIL: Missing columns'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'purchase_requests';

-- 4. Check purchase_request_id column in transactions
SELECT
    'Foreign Key Check' as check_type,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 1 THEN '✅ PASS: purchase_request_id column exists'
        ELSE '❌ FAIL: purchase_request_id column missing'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
  AND column_name = 'purchase_request_id';

-- 5. Check Views
SELECT
    'Views Check' as check_type,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 2 THEN '✅ PASS: Both views created'
        ELSE '❌ FAIL: Expected 2 views, found ' || COUNT(*)
    END as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('daily_stats', 'brand_stats');

-- 6. Show All Tables and Row Counts
SELECT
    'Final Summary' as check_type,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
