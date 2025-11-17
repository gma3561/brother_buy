# 데이터베이스 안전성 체크

## 🔍 1단계: 현재 DB 상태 확인

### Supabase SQL Editor에서 실행:

```bash
open supabase/migrations/check_current_db.sql
```

→ 내용 복사 → Supabase SQL Editor 붙여넣기 → **RUN** ▶️

**확인할 내용:**
- 📋 현재 어떤 테이블이 있는지
- 📊 각 테이블에 데이터가 몇 개 있는지
- 👁️ 어떤 뷰가 있는지
- ⚙️ 어떤 함수가 있는지

---

## ⚠️ ALL_IN_ONE_SETUP.sql 실행 시 영향

### ❌ 삭제되는 것들 (PART 1: CLEANUP)

```sql
DROP VIEW IF EXISTS public.brand_stats CASCADE;
DROP VIEW IF EXISTS public.daily_stats CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.giftcard_brands CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
```

**의미:**
- ✅ `IF EXISTS` → 없어도 에러 안남
- ✅ `CASCADE` → 종속된 객체도 함께 삭제
- ❌ **모든 데이터 영구 삭제!**

---

### ✅ 새로 생성되는 것들 (PART 2: INITIALIZATION)

**테이블 3개:**
1. `giftcard_brands` - 상품권 브랜드 (8개)
2. `purchase_requests` - 매입 신청 내역
3. `transactions` - 거래 내역

**뷰 2개:**
1. `daily_stats` - 일별 통계
2. `brand_stats` - 브랜드별 통계

**함수 1개:**
1. `update_updated_at_column()` - 자동 업데이트 트리거

**초기 데이터:**
- 8개 상품권 브랜드 삽입 (hyundai, galleria, lotte, etc.)

---

## 🛡️ 안전성 분석

### ✅ 겹침 방지 메커니즘

```sql
-- 1. 테이블 생성 시
CREATE TABLE IF NOT EXISTS public.giftcard_brands (...)

-- 2. 데이터 삽입 시
INSERT INTO public.giftcard_brands (...)
ON CONFLICT (brand_code) DO NOTHING;
```

**의미:**
- `IF NOT EXISTS` → 이미 있으면 생성 안함
- `ON CONFLICT DO NOTHING` → 중복 데이터 무시

---

### ⚠️ 주의사항

**이 스크립트는:**
1. ✅ 오류 없이 실행됨
2. ✅ 충돌 없이 실행됨
3. ❌ **기존 데이터를 모두 삭제함!**

**따라서:**
- 🆕 **처음 설정**하는 경우 → 안전하게 실행
- 📊 **기존 데이터 있음** → ⚠️ 모두 삭제됨!

---

## 🎯 시나리오별 가이드

### 시나리오 1: 완전히 새로운 데이터베이스 (추천)

```
현재 상태: 테이블 없음 또는 테스트 데이터만
행동: ALL_IN_ONE_SETUP.sql 실행 ✅
결과: 깨끗한 새 데이터베이스
```

### 시나리오 2: 기존 데이터가 있고 보존해야 함

```
현재 상태: purchase_requests에 실제 데이터 100개
행동: ❌ ALL_IN_ONE_SETUP.sql 실행하면 안됨!
대안:
  1. 데이터 백업 먼저
  2. 필요한 테이블만 수동으로 추가
  3. 또는 마이그레이션 스크립트 별도 작성
```

### 시나리오 3: 오류 있는 데이터베이스 (현재 추정 상황)

```
현재 상태: "column purchase_request_id does not exist" 오류
원인: 이전 시도로 인한 불완전한 스키마
행동: ALL_IN_ONE_SETUP.sql 실행 ✅
결과: 모든 오류 해결, 완전한 스키마
```

---

## 📋 실행 전 체크리스트

- [ ] check_current_db.sql 실행해서 현재 상태 확인
- [ ] 보존해야 할 데이터가 있는지 확인
- [ ] 백업 필요 시 백업 완료
- [ ] ⚠️ 모든 데이터가 삭제된다는 것 이해함
- [ ] 준비됨! ALL_IN_ONE_SETUP.sql 실행

---

## 🔄 백업 방법 (필요 시)

### Supabase Dashboard에서:

1. **Table Editor** 열기
2. 각 테이블 선택
3. **Export → CSV** 클릭
4. 파일 저장

### 또는 SQL로:

```sql
-- 브랜드 데이터 백업
SELECT * FROM giftcard_brands;

-- 매입 신청 데이터 백업
SELECT * FROM purchase_requests;

-- 거래 내역 백업
SELECT * FROM transactions;
```

---

## 💡 결론

**ALL_IN_ONE_SETUP.sql은:**
- ✅ 안전하게 실행됨 (오류 없음)
- ✅ 충돌 없이 실행됨 (겹침 방지)
- ⚠️ 기존 데이터 모두 삭제함

**현재 상황 (추정):**
- 이전 마이그레이션 실패로 불완전한 스키마
- 보존할 실제 데이터 없음
- → **ALL_IN_ONE_SETUP.sql 실행 권장** ✅

---

**작성일:** 2024-11-16
**목적:** 데이터베이스 설정 전 안전성 확인
