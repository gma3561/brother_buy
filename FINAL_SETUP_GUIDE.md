# 최종 설정 가이드 (Final Setup Guide)

## 🎯 3단계로 완료하기 (Complete in 3 Steps)

---

## ✅ 준비물 체크리스트

- [ ] Supabase 대시보드 로그인 완료
- [ ] SQL Editor 열림 (`https://supabase.com/dashboard/project/jzuyxmyqkpkxgtpyvoal/sql`)
- [ ] 아래 3개 파일 준비됨:
  - `cleanup_database.sql`
  - `20251116065734_init_schema.sql`
  - `verify_setup.sql`

---

## 🚨 가장 중요한 규칙

**반드시 순서대로 실행하세요!**

```
1️⃣ cleanup_database.sql    (먼저 실행)
           ↓
2️⃣ init_schema.sql         (그 다음 실행)
           ↓
3️⃣ verify_setup.sql        (확인용)
```

**❌ 절대 하지 마세요:**
- init_schema.sql을 먼저 실행
- cleanup을 건너뛰고 init만 실행
- 순서를 바꿔서 실행

---

## 📋 STEP 1: 기존 데이터베이스 삭제 (필수!)

### 1-1. 파일 열기

```bash
open supabase/migrations/cleanup_database.sql
```

### 1-2. Supabase SQL Editor에서 실행

1. 파일 내용 **전체 복사** (Cmd+A, Cmd+C)
2. Supabase SQL Editor에 **붙여넣기** (Cmd+V)
3. **RUN** 버튼 클릭 ▶️

### 1-3. 성공 확인

다음 메시지가 나타나면 성공:
```
Success. No rows returned
```

또는
```
Success
0 rows
```

**❌ 오류가 나도 괜찮습니다!** "table does not exist" 같은 오류는 정상입니다. 계속 진행하세요.

---

## 📋 STEP 2: 새 데이터베이스 생성

### 2-1. 파일 열기

```bash
open supabase/migrations/20251116065734_init_schema.sql
```

### 2-2. Supabase SQL Editor에서 실행

1. **새 Query 탭 열기** (중요!)
2. 파일 내용 **전체 복사** (Cmd+A, Cmd+C)
3. Supabase SQL Editor에 **붙여넣기** (Cmd+V)
4. **RUN** 버튼 클릭 ▶️

### 2-3. 성공 확인

다음 메시지가 나타나면 성공:
```
Success. No rows returned
```

**이 단계에서 오류가 나면 안됩니다!**

만약 오류가 나면:
1. STEP 1을 다시 실행
2. 새 Query 탭에서 STEP 2를 다시 실행

---

## 📋 STEP 3: 설정 확인 (검증)

### 3-1. 검증 스크립트 실행

```bash
open supabase/migrations/verify_setup.sql
```

1. **새 Query 탭 열기**
2. 파일 내용 **전체 복사**
3. **붙여넣기**
4. **RUN** 버튼 클릭 ▶️

### 3-2. 결과 확인

모든 항목이 ✅ PASS 여야 합니다:

```
✅ PASS: All 3 tables exist
✅ PASS: All 8 brands loaded
✅ PASS: All columns exist
✅ PASS: purchase_request_id column exists
✅ PASS: Both views created
```

**모두 PASS면 성공!** 🎉

---

## 🔍 수동 확인 방법

### 테이블 확인

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**예상 결과:**
```
giftcard_brands
purchase_requests
transactions
```

### 브랜드 데이터 확인

```sql
SELECT brand_name, buy_rate
FROM giftcard_brands
ORDER BY brand_name;
```

**예상 결과:** 8개 브랜드
- AK Plaza (95.5%)
- Cultureland (94.0%)
- E-mart (95.0%)
- Galleria Department Store (96.5%)
- Hanwha Galleria (96.0%)
- Hyundai Department Store (96.5%)
- Lotte Department Store (96.0%)
- Shinsegae Department Store (96.5%)

### purchase_request_id 컬럼 확인

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
  AND column_name = 'purchase_request_id';
```

**예상 결과:**
```
purchase_request_id | uuid
```

---

## 🚨 문제 해결

### ❌ "column purchase_request_id does not exist" 오류

**원인:** STEP 1을 건너뛰고 STEP 2를 실행함

**해결:**
1. STEP 1 실행 (cleanup_database.sql)
2. STEP 2 재실행 (init_schema.sql)

### ❌ "table already exists" 오류

**원인:** cleanup_database.sql을 실행하지 않음

**해결:**
1. STEP 1 실행 (cleanup_database.sql)
2. STEP 2 재실행 (init_schema.sql)

### ❌ "Failed to run sql query" 오류

**해결:**
1. SQL Editor에서 이전 쿼리 내용 모두 삭제
2. 새 Query 탭 열기
3. STEP 1부터 다시 시작

---

## ✅ 완료 후 다음 단계

데이터베이스 설정이 완료되면:

### 1. 웹사이트 테스트

```bash
cd /Users/hasanghyeon/brother_buy
python3 -m http.server 8080
```

브라우저: `http://localhost:8080/index-online.html`

### 2. 테스트 매입 신청

**테스트 데이터:**
- 상품권: 현대백화점
- 금액: 100000
- 성함: 테스트
- 연락처: 010-1234-5678
- 계좌: 우리은행 1002-123-456789
- PIN: 1234567890123456

### 3. 데이터 확인

Supabase → Table Editor → `purchase_requests`

새 행이 추가되었는지 확인!

---

## 📞 도움이 필요하면

1. 오류 메시지 전체를 복사해서 보내주세요
2. 어느 단계에서 문제가 발생했는지 알려주세요
3. 검증 스크립트 결과를 보내주세요

---

**작성일:** 2024-11-16
**목적:** "purchase_request_id does not exist" 오류 완전 해결
