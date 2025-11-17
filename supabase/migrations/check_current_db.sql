-- ============================================
-- 현재 데이터베이스 상태 확인
-- ============================================

-- 1. 모든 테이블 목록
SELECT
    '📋 테이블' as type,
    table_name as name,
    'public' as schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. 모든 뷰 목록
SELECT
    '👁️ 뷰' as type,
    table_name as name,
    'public' as schema
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. 모든 함수 목록
SELECT
    '⚙️ 함수' as type,
    routine_name as name,
    'public' as schema
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 4. 각 테이블의 행 개수
SELECT
    '📊 데이터' as type,
    schemaname || '.' || tablename as table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
