# 🛡️ 안전 확인: 판매 사이트 테이블 보호

## ⚠️ 중요한 문제!

brother_buy는 **매입** 사이트인데, 같은 Supabase 프로젝트에 **판매** 사이트 테이블도 있을 수 있습니다!

---

## 📋 ALL_IN_ONE_SETUP.sql이 삭제하는 것들

### ❌ 삭제되는 테이블 (PART 1)

```sql
DROP VIEW IF EXISTS public.brand_stats CASCADE;
DROP VIEW IF EXISTS public.daily_stats CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.giftcard_brands CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
```

**정확히 이것만 삭제됩니다:**
1. ❌ `brand_stats` (뷰)
2. ❌ `daily_stats` (뷰)
3. ❌ `transactions` (테이블)
4. ❌ `purchase_requests` (테이블)
5. ❌ `giftcard_brands` (테이블)
6. ❌ `update_updated_at_column()` (함수)

---

## ✅ 건드리지 않는 것들

**다른 모든 테이블/뷰/함수는 그대로 유지됩니다!**

예를 들어 이런 것들이 있다면:
- ✅ `sales_orders` → **안전** (유지됨)
- ✅ `customers` → **안전** (유지됨)
- ✅ `products` → **안전** (유지됨)
- ✅ `sell_requests` → **안전** (유지됨)
- ✅ `payments` → **안전** (유지됨)
- ✅ 기타 모든 테이블 → **안전** (유지됨)

---

## 🔍 1단계: 현재 DB 전체 확인 (필수!)

### Supabase SQL Editor에서 실행:

```bash
open supabase/migrations/check_current_db.sql
```

**확인할 것:**
```
📋 테이블 목록:
- giftcard_brands (매입용) ← 삭제됨
- purchase_requests (매입용) ← 삭제됨
- transactions (매입용) ← 삭제됨
- sales_orders (판매용) ← 유지됨 ✅
- customers (판매용) ← 유지됨 ✅
- ... 기타 ...
```

---

## 🎯 안전한 실행 조건

### ✅ 안전한 경우

1. **매입 테이블만 있음**
   - giftcard_brands, purchase_requests, transactions만 존재
   - → ALL_IN_ONE_SETUP.sql 안전하게 실행 가능

2. **판매 테이블이 별도로 있음**
   - sales_*, sell_*, customers 등 다른 이름 사용
   - → ALL_IN_ONE_SETUP.sql이 건드리지 않음
   - → 안전하게 실행 가능 ✅

### ⚠️ 주의가 필요한 경우

1. **같은 이름 사용**
   - 판매 사이트도 `transactions` 테이블 사용
   - → 충돌 발생! 삭제됨!

2. **외래 키 관계**
   - 판매 테이블이 `giftcard_brands`를 참조
   - → CASCADE로 인해 영향받을 수 있음

---

## 📊 확인 쿼리

### Supabase SQL Editor에서 실행:

```sql
-- 모든 테이블 이름과 행 개수
SELECT
    tablename as table_name,
    n_live_tup as row_count,
    CASE
        WHEN tablename IN ('giftcard_brands', 'purchase_requests', 'transactions')
        THEN '❌ 삭제됨'
        ELSE '✅ 유지됨'
    END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**결과 예시:**
```
customers          | 50   | ✅ 유지됨
giftcard_brands    | 8    | ❌ 삭제됨
products           | 100  | ✅ 유지됨
purchase_requests  | 5    | ❌ 삭제됨
sales_orders       | 75   | ✅ 유지됨
transactions       | 10   | ❌ 삭제됨
```

---

## 🛡️ 외래 키 관계 확인

### 다른 테이블이 매입 테이블을 참조하는지 확인:

```sql
SELECT
    tc.table_name as referencing_table,
    kcu.column_name as referencing_column,
    ccu.table_name as referenced_table,
    ccu.column_name as referenced_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name IN ('giftcard_brands', 'purchase_requests', 'transactions')
  AND tc.table_schema = 'public';
```

**의미:**
- 결과 없음 → ✅ 안전
- 결과 있음 → ⚠️ 다른 테이블이 영향받을 수 있음

---

## 💡 권장 실행 순서

### 1️⃣ 현재 상태 파악
```bash
open supabase/migrations/check_current_db.sql
```
→ 모든 테이블 목록 확인

### 2️⃣ 안전성 확인
- 판매 관련 테이블이 있나?
- 삭제될 테이블과 이름이 겹치나?
- 외래 키 관계가 있나?

### 3️⃣ 실행 결정

**케이스 A: 매입 테이블만 있음**
```
→ ALL_IN_ONE_SETUP.sql 바로 실행 ✅
```

**케이스 B: 판매 테이블도 있지만 독립적**
```
예: sales_orders, customers, products
→ ALL_IN_ONE_SETUP.sql 안전하게 실행 ✅
```

**케이스 C: 판매 테이블이 매입 테이블 참조**
```
예: sales_orders → giftcard_brands 외래 키
→ ⚠️ 백업 필수!
→ 외래 키 제거 또는 CASCADE 고려
```

---

## 🚨 긴급 백업 방법

### 전체 데이터베이스 백업:

**Supabase Dashboard:**
1. Settings → Database
2. **Backups** 탭
3. **Create backup** 클릭

**또는 pg_dump (로컬):**
```bash
# Supabase connection string 필요
pg_dump -h db.jzuyxmyqkpkxgtpyvoal.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_$(date +%Y%m%d_%H%M%S).dump
```

---

## ✅ 결론

**ALL_IN_ONE_SETUP.sql은:**
- ❌ 6개 객체만 삭제 (정확히 명시된 것만)
- ✅ 다른 모든 테이블/뷰/함수 유지
- ✅ 판매 사이트 테이블 안전 (다른 이름 사용 시)

**하지만 먼저:**
1. check_current_db.sql 실행
2. 모든 테이블 목록 확인
3. 판매 관련 테이블 있는지 체크
4. 안전하다고 판단되면 실행!

---

**작성일:** 2024-11-16
**목적:** 판매 사이트 테이블 보호 확인
