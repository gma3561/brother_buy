# SQL Migration Files Guide

## 📁 파일 목록 (File List)

### ⭐ 추천: 간편 설정 (Recommended: Easy Setup)

**`ALL_IN_ONE_SETUP.sql`** - 단 한 번의 실행으로 모든 설정 완료
- 기존 데이터 삭제 + 새 데이터베이스 생성을 한 번에 처리
- 가장 간단하고 안전한 방법
- **사용법:**
  ```bash
  open supabase/migrations/ALL_IN_ONE_SETUP.sql
  ```
  → Supabase SQL Editor에 복사 & 붙여넣기 → RUN

---

### 📋 수동 설정 (Manual Setup - 2 Steps)

더 세밀한 제어가 필요한 경우:

#### 1️⃣ **`cleanup_database.sql`** - 데이터베이스 초기화
- 모든 테이블, 뷰, 함수 삭제
- 새로 시작할 때 실행
- **먼저 실행해야 함!**

#### 2️⃣ **`20251116065734_init_schema.sql`** - 데이터베이스 생성
- 3개 테이블 생성 (giftcard_brands, purchase_requests, transactions)
- 8개 브랜드 데이터 삽입
- 인덱스, 트리거, RLS, 뷰 생성
- **cleanup 이후에 실행**

---

### ✅ **`verify_setup.sql`** - 설정 확인
- 데이터베이스가 올바르게 설정되었는지 검증
- 모든 테이블, 컬럼, 뷰가 존재하는지 확인
- 설정 완료 후 반드시 실행 권장

---

## 🚀 빠른 시작 (Quick Start)

### 방법 A: 올인원 (가장 간단!)

```bash
# 1. 파일 열기
open supabase/migrations/ALL_IN_ONE_SETUP.sql

# 2. Supabase SQL Editor에서
#    - 내용 전체 복사 (Cmd+A, Cmd+C)
#    - SQL Editor에 붙여넣기 (Cmd+V)
#    - RUN 클릭 ▶️

# 3. 검증
open supabase/migrations/verify_setup.sql
# → 복사 & 붙여넣기 → RUN
```

### 방법 B: 수동 (단계별 제어)

```bash
# 1. 삭제
open supabase/migrations/cleanup_database.sql
# → 복사 & 붙여넣기 → RUN

# 2. 생성
open supabase/migrations/20251116065734_init_schema.sql
# → 복사 & 붙여넣기 → RUN

# 3. 검증
open supabase/migrations/verify_setup.sql
# → 복사 & 붙여넣기 → RUN
```

---

## ❌ 흔한 오류 해결

### "column purchase_request_id does not exist"

**원인:** cleanup을 실행하지 않고 init_schema.sql을 실행함

**해결:**
- ALL_IN_ONE_SETUP.sql 사용 (추천)
- 또는 cleanup → init 순서로 실행

### "table already exists"

**원인:** cleanup을 실행하지 않음

**해결:**
- ALL_IN_ONE_SETUP.sql 사용 (추천)
- 또는 cleanup_database.sql 먼저 실행

---

## 📊 데이터베이스 구조

### 테이블 3개
1. **giftcard_brands** - 상품권 브랜드 정보 (8개)
2. **purchase_requests** - 매입 신청 내역
3. **transactions** - 거래 내역

### 뷰 2개
1. **daily_stats** - 일별 통계
2. **brand_stats** - 브랜드별 통계

### 브랜드 목록
- Hyundai Department Store (96.5%)
- Galleria Department Store (96.5%)
- Shinsegae Department Store (96.5%)
- Hanwha Galleria (96.0%)
- Lotte Department Store (96.0%)
- AK Plaza (95.5%)
- E-mart (95.0%)
- Cultureland (94.0%)

---

## 📚 추가 문서

- **FINAL_SETUP_GUIDE.md** - 최종 설정 가이드 (한글)
- **STEP_BY_STEP.md** - 단계별 상세 가이드
- **QUICK_START.md** - 빠른 시작 가이드
- **SUPABASE_SETUP.md** - Supabase 설정 가이드

---

**작성일:** 2024-11-16
**버전:** 1.0.0
