# 브라더상품권 - 빠른 시작 가이드

## 🎯 전체 설정 (3단계, 5분)

### 1️⃣ 데이터베이스 초기화

#### 옵션 A: 처음 설정하는 경우

```bash
# SQL 파일 열기
open supabase/migrations/20251116065734_init_schema.sql
```

1. Supabase 대시보드: https://supabase.com/dashboard/project/jzuyxmyqkpkxgtpyvoal
2. SQL Editor 열기
3. 파일 내용 전체 복사 & 붙여넣기
4. **RUN** 버튼 클릭

#### 옵션 B: 기존 데이터 삭제 후 재설정

```bash
# 삭제 SQL 파일 열기
open supabase/migrations/cleanup_database.sql
```

**순서**:
1. **먼저** cleanup_database.sql 실행 (기존 데이터 삭제)
2. **그 다음** 20251116065734_init_schema.sql 실행 (새로 생성)

---

### 2️⃣ 웹사이트 실행

```bash
cd /Users/hasanghyeon/brother_buy
python3 -m http.server 8080
```

브라우저: http://localhost:8080/index-online.html

---

### 3️⃣ 테스트

**매입 신청 섹션**에서 테스트:

```
상품권 종류: 현대백화점
금액: 100000
성함: 테스트
연락처: 010-1234-5678
계좌: 우리은행 1002-123-456789
PIN: 1234567890123456
```

**데이터 확인**:
- Supabase → Table Editor → `purchase_requests` 테이블
- 새 행 추가되었는지 확인

---

## 📁 주요 SQL 파일

### 생성 & 초기화
```
supabase/migrations/20251116065734_init_schema.sql
```
- ✅ 3개 테이블 생성
- ✅ 8개 브랜드 데이터 삽입
- ✅ 인덱스, 트리거, RLS, 뷰 생성

### 삭제 & 정리
```
supabase/migrations/cleanup_database.sql
```
- ❌ 모든 테이블 삭제
- ❌ 모든 뷰 삭제
- ❌ 모든 함수 삭제
- ⚠️ **주의**: 모든 데이터가 삭제됩니다!

---

## 🔍 유용한 SQL 쿼리

### 데이터 확인
```sql
-- 모든 브랜드 보기
SELECT * FROM giftcard_brands;

-- 최근 매입 신청 5개
SELECT * FROM purchase_requests
ORDER BY created_at DESC
LIMIT 5;

-- 오늘 통계
SELECT * FROM daily_stats
WHERE date = CURRENT_DATE;
```

### 데이터 삭제 (선택적)
```sql
-- 모든 매입 신청 삭제 (테이블은 유지)
DELETE FROM purchase_requests;

-- 모든 거래 내역 삭제 (테이블은 유지)
DELETE FROM transactions;

-- 특정 신청 삭제
DELETE FROM purchase_requests
WHERE customer_phone = '010-1234-5678';
```

---

## 🚨 문제 해결

### ❌ 테이블이 이미 존재한다는 오류

**해결**: cleanup_database.sql 먼저 실행

```bash
# 1. 삭제
open supabase/migrations/cleanup_database.sql
# → Supabase에서 실행

# 2. 재생성
open supabase/migrations/20251116065734_init_schema.sql
# → Supabase에서 실행
```

### ❌ "Failed to run sql query" 오류

**가능한 원인**:
1. RLS 정책 충돌 → cleanup_database.sql 실행 후 재시도
2. 외래 키 제약 → CASCADE로 삭제됨 (cleanup_database.sql)
3. 트리거 충돌 → DROP TRIGGER IF EXISTS로 해결

### ❌ Edge Function 오류

**현재**: Edge Function은 아직 배포하지 않아도 됩니다.
- 데이터베이스만 설정하면 프론트엔드에서 직접 Supabase Client로 데이터 저장 가능
- 나중에 PIN 검증 등이 필요할 때 배포

---

## ✅ 완료 체크리스트

**데이터베이스**:
- [ ] SQL 마이그레이션 실행
- [ ] giftcard_brands 테이블 확인 (8개 행)
- [ ] purchase_requests 테이블 확인 (0개 행)
- [ ] transactions 테이블 확인 (0개 행)

**웹사이트**:
- [ ] 로컬 서버 실행 (http://localhost:8080)
- [ ] index-online.html 접속
- [ ] 테스트 매입 신청
- [ ] Supabase에서 데이터 확인

---

## 📚 추가 문서

- **상세 배포 가이드**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Supabase 설정**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **전체 README**: [README-SUPABASE.md](./README-SUPABASE.md)

---

**작성일**: 2024-11-16
**버전**: 1.0.0
