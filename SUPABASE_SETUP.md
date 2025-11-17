# Supabase 즉시 설정 가이드

## 🚀 빠른 시작 (5분 완료)

### ✅ Step 1: SQL 마이그레이션 실행

#### 방법 A: 파일에서 직접 복사 (추천)

1. **SQL 파일 열기**
   ```bash
   # Mac/Linux
   open supabase/migrations/20251116065734_init_schema.sql

   # 또는 VS Code
   code supabase/migrations/20251116065734_init_schema.sql
   ```

2. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/jzuyxmyqkpkxgtpyvoal
   ```

3. **SQL Editor에서 실행**
   - 왼쪽 메뉴 → `SQL Editor` 클릭
   - 파일 내용 전체 복사 & 붙여넣기
   - `RUN` 버튼 클릭

4. **결과 확인**
   - 성공 메시지: "Success. No rows returned"
   - Table Editor에서 테이블 확인:
     - ✅ giftcard_brands (8개 행)
     - ✅ purchase_requests (0개 행)
     - ✅ transactions (0개 행)

#### 방법 B: CLI 사용 (Docker 필요)

```bash
supabase login
supabase link --project-ref jzuyxmyqkpkxgtpyvoal
supabase db push
```

---

### ✅ Step 2: Edge Functions 배포 (선택사항)

현재는 **배포 없이도 작동**합니다! Edge Function은 나중에 배포할 수 있습니다.

배포하려면:

```bash
# Supabase CLI 로그인
supabase login

# Edge Function 배포
supabase functions deploy submit-purchase
```

배포 후 URL:
```
https://jzuyxmyqkpkxgtpyvoal.supabase.co/functions/v1/submit-purchase
```

---

### ✅ Step 3: 웹사이트 테스트

1. **로컬 서버 실행**
   ```bash
   cd /Users/hasanghyeon/brother_buy
   python3 -m http.server 8080
   ```

2. **브라우저 열기**
   ```
   http://localhost:8080/index-online.html
   ```

3. **매입 신청 테스트**
   - 매입신청 섹션으로 스크롤
   - 테스트 데이터 입력:
     - 상품권: 현대백화점
     - 금액: 100000
     - 성함: 테스트
     - 연락처: 010-1234-5678
     - 계좌: 우리은행 1002-123-456789
     - PIN: 1234567890123456
   - `매입 신청하기` 클릭

4. **데이터 확인**
   - Supabase 대시보드 → Table Editor
   - `purchase_requests` 테이블 확인
   - 새로운 행이 추가되었는지 확인

---

## 🔍 문제 해결

### ❌ "Failed to run sql query"

**원인**: SQL 파일 인코딩 문제

**해결**:
- 파일이 UTF-8로 저장되었는지 확인
- 영어 버전 SQL 파일 사용 (20251116065734_init_schema.sql)

### ❌ Edge Function 호출 오류

**원인**: Function이 아직 배포되지 않음

**해결**:
1. 임시로 로컬 테스트만 진행
2. 또는 Edge Function 배포:
   ```bash
   supabase functions deploy submit-purchase
   ```

### ❌ CORS 오류

**원인**: 브라우저 보안 정책

**해결**:
- 파일을 직접 열지 말고 로컬 서버 사용
- `python3 -m http.server 8080`

---

## 📊 데이터 확인 SQL

### 모든 테이블 확인
```sql
-- 브랜드 목록
SELECT * FROM giftcard_brands;

-- 매입 신청 내역
SELECT * FROM purchase_requests ORDER BY created_at DESC;

-- 거래 내역
SELECT * FROM transactions ORDER BY created_at DESC;
```

### 통계 확인
```sql
-- 일일 통계
SELECT * FROM daily_stats ORDER BY date DESC LIMIT 7;

-- 브랜드별 통계
SELECT * FROM brand_stats;
```

---

## ✅ 완료 체크리스트

- [ ] SQL 마이그레이션 실행 완료
- [ ] 테이블 생성 확인 (giftcard_brands, purchase_requests, transactions)
- [ ] 8개 브랜드 데이터 확인
- [ ] 로컬 웹사이트 실행
- [ ] 테스트 매입 신청
- [ ] 데이터베이스에 데이터 저장 확인

---

## 🎯 다음 단계

1. **실제 PIN 검증 구현**
   - 각 상품권 브랜드 API 연동
   - verify-pin Edge Function 완성

2. **자동 입금 시스템**
   - 은행 API 연동
   - 실시간 입금 처리

3. **관리자 대시보드**
   - 매입 신청 관리
   - 상태 업데이트
   - 통계 확인

---

**작성일**: 2024-11-16
**파일**: supabase/migrations/20251116065734_init_schema.sql
