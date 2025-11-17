-- ============================================
-- 외래 키 관계 확인
-- ============================================
-- 다른 테이블이 매입 테이블을 참조하는지 확인

-- 매입 테이블을 참조하는 외래 키 찾기
SELECT
    '🔗 외래 키' as type,
    tc.table_name as "참조하는_테이블",
    kcu.column_name as "참조하는_컬럼",
    ccu.table_name as "참조되는_테이블",
    ccu.column_name as "참조되는_컬럼",
    CASE
        WHEN ccu.table_name IN ('giftcard_brands', 'purchase_requests', 'transactions')
        THEN '⚠️ 삭제 시 영향받음'
        ELSE '✅ 안전'
    END as "영향도"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY ccu.table_name, tc.table_name;

-- 삭제 예정 테이블을 참조하는 테이블만 필터링
SELECT
    '⚠️ 주의 필요' as status,
    tc.table_name as "이_테이블이",
    kcu.column_name as "컬럼으로",
    ccu.table_name as "참조함",
    '→ ALL_IN_ONE_SETUP.sql 실행 시 CASCADE로 인해 영향받을 수 있음' as "경고"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name IN ('giftcard_brands', 'purchase_requests', 'transactions')
  AND tc.table_name NOT IN ('giftcard_brands', 'purchase_requests', 'transactions');

-- 결과가 없으면 안전함!
