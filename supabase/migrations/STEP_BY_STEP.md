# 단계별 실행 가이드

## ⚠️ 중요: 반드시 순서대로 실행하세요!

---

## 🗑️ STEP 1: 기존 데이터베이스 삭제 (필수!)

### 파일: `cleanup_database.sql`

```bash
# 파일 열기
open supabase/migrations/cleanup_database.sql
```

**Supabase SQL Editor에서**:
1. 파일 내용 전체 복사
2. SQL Editor에 붙여넣기
3. **RUN** 클릭
4. 성공 메시지 확인

**예상 결과**:
```
Success. No rows returned
```

---

## ✅ STEP 2: 새 데이터베이스 생성

### 파일: `20251116065734_init_schema.sql`

```bash
# 파일 열기
open supabase/migrations/20251116065734_init_schema.sql
```

**Supabase SQL Editor에서**:
1. 파일 내용 전체 복사
2. SQL Editor에 붙여넣기
3. **RUN** 클릭
4. 성공 메시지 확인

**예상 결과**:
```
Success. No rows returned
```

---

## 🔍 STEP 3: 확인

### 3-1. 테이블 확인

**SQL**:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과**:
```
giftcard_brands
purchase_requests
transactions
```

### 3-2. 브랜드 데이터 확인

**SQL**:
```sql
SELECT * FROM giftcard_brands;
```

**예상 결과**: 8개 행
- Hyundai Department Store (96.5%)
- Galleria Department Store (96.5%)
- Lotte Department Store (96.0%)
- Shinsegae Department Store (96.5%)
- AK Plaza (95.5%)
- Hanwha Galleria (96.0%)
- E-mart (95.0%)
- Cultureland (94.0%)

### 3-3. 컬럼 확인

**SQL**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
```

**확인 사항**:
- ✅ `purchase_request_id` 컬럼이 있어야 함
- ✅ 타입: UUID

---

## ❌ 문제 해결

### "column purchase_request_id does not exist" 오류

**원인**: STEP 1을 건너뛰고 바로 STEP 2를 실행함

**해결**:
1. 다시 STEP 1부터 시작 (cleanup_database.sql)
2. STEP 2 실행 (init_schema.sql)

### "table already exists" 오류

**원인**: cleanup_database.sql을 실행하지 않음

**해결**:
1. STEP 1 실행 (cleanup_database.sql)
2. STEP 2 재실행 (init_schema.sql)

---

## 📋 체크리스트

실행 전 확인:

- [ ] Supabase 대시보드 로그인 완료
- [ ] SQL Editor 열림
- [ ] cleanup_database.sql 준비됨
- [ ] init_schema.sql 준비됨

실행 순서:

- [ ] ✅ STEP 1: cleanup_database.sql 실행
- [ ] ✅ STEP 2: init_schema.sql 실행
- [ ] ✅ STEP 3: 테이블 확인
- [ ] ✅ STEP 4: 브랜드 데이터 확인 (8개 행)

---

## 🎯 전체 과정 (복사 & 붙여넣기)

### 1️⃣ 삭제 SQL (cleanup_database.sql)

```sql
DROP VIEW IF EXISTS public.brand_stats CASCADE;
DROP VIEW IF EXISTS public.daily_stats CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;
DROP TABLE IF EXISTS public.giftcard_brands CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
```

↓ **RUN** 클릭

### 2️⃣ 생성 SQL (init_schema.sql)

```bash
# 파일에서 복사
open supabase/migrations/20251116065734_init_schema.sql
```

↓ 전체 복사 & 붙여넳기

↓ **RUN** 클릭

---

**작성일**: 2024-11-16
**목적**: 오류 없이 확실하게 데이터베이스 설정
