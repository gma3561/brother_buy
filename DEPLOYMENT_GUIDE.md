# 브라더상품권 Supabase 배포 가이드

## 📋 개요

이 문서는 브라더상품권 매입 시스템을 Supabase를 사용하여 배포하는 방법을 설명합니다.

## 🔧 사전 요구사항

1. Supabase 계정 (https://supabase.com)
2. 프로젝트 생성 완료
3. 프로젝트 정보 확인:
   - Project URL: `https://jzuyxmyqkpkxgtpyvoal.supabase.co`
   - Anon Key: 확인됨
   - Service Role Key: 확인됨

## 📦 1단계: 데이터베이스 마이그레이션 실행

### 옵션 A: Supabase 대시보드 사용 (권장)

1. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/jzuyxmyqkpkxgtpyvoal
   ```

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭

3. **마이그레이션 SQL 실행**
   - `supabase/migrations/20251116054059_init_giftcard_schema.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭

4. **테이블 확인**
   - 왼쪽 메뉴에서 `Table Editor` 클릭
   - 생성된 테이블 확인:
     - ✅ `giftcard_brands` (상품권 브랜드)
     - ✅ `purchase_requests` (매입 신청)
     - ✅ `transactions` (거래 내역)

### 옵션 B: CLI 사용 (로컬 Docker 필요)

```bash
# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref jzuyxmyqkpkxgtpyvoal

# 마이그레이션 실행
supabase db push
```

## 🚀 2단계: Edge Functions 배포

### 필수: Supabase CLI 로그인

```bash
# CLI 로그인 (브라우저 열림)
supabase login

# 프로젝트 연결 확인
supabase projects list
```

### Edge Function 배포

```bash
# submit-purchase 함수 배포
supabase functions deploy submit-purchase

# 배포 확인
supabase functions list
```

### Edge Function URL

배포 후 함수 URL:
```
https://jzuyxmyqkpkxgtpyvoal.supabase.co/functions/v1/submit-purchase
```

## 🔐 3단계: Row Level Security (RLS) 확인

RLS 정책은 마이그레이션에 포함되어 있습니다:

### giftcard_brands (상품권 브랜드)
- ✅ 모든 사용자 읽기 허용

### purchase_requests (매입 신청)
- ✅ 인증된 사용자만 접근 (관리자 전용)

### transactions (거래 내역)
- ✅ 인증된 사용자만 접근 (관리자 전용)

## 📱 4단계: 프론트엔드 배포

### 파일 구조
```
brother_buy/
├── index-online.html      # 메인 페이지 (Supabase 연동 완료)
├── script-online.js       # JavaScript (API 호출 로직)
├── style-online.css       # 스타일
└── images/               # 이미지 파일들
```

### 배포 옵션

#### 옵션 1: GitHub Pages
```bash
# Git 저장소 초기화 (아직 안했다면)
git init
git add .
git commit -m "Initial commit: 브라더상품권 매입 시스템"

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/brother-giftcard.git
git push -u origin main

# GitHub Pages 설정
# Settings → Pages → Source: main branch
```

#### 옵션 2: Netlify
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy --prod
```

#### 옵션 3: Vercel
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

## 🧪 5단계: 테스트

### 1. 데이터베이스 테스트

SQL Editor에서 실행:

```sql
-- 상품권 브랜드 확인
SELECT * FROM giftcard_brands;

-- 매입 신청 테스트 데이터 삽입
INSERT INTO purchase_requests (
  brand_id,
  brand_code,
  amount,
  pin_encrypted,
  customer_name,
  customer_phone,
  account_info,
  buy_rate,
  payment_amount
) VALUES (
  (SELECT id FROM giftcard_brands WHERE brand_code = 'hyundai'),
  'hyundai',
  100000,
  'dGVzdDEyMzQ1Njc4OTAxMjM0NTY=', -- Base64 encoded test PIN
  '테스트',
  '010-1234-5678',
  '우리은행 1002-123-456789',
  96.5,
  96500
);

-- 삽입된 데이터 확인
SELECT * FROM purchase_requests ORDER BY created_at DESC LIMIT 1;
```

### 2. Edge Function 테스트

```bash
# curl로 테스트
curl -X POST \
  https://jzuyxmyqkpkxgtpyvoal.supabase.co/functions/v1/submit-purchase \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "hyundai",
    "amount": 100000,
    "name": "테스트",
    "phone": "010-1234-5678",
    "account": "우리은행 1002-123-456789",
    "pin": "1234567890123456",
    "message": "테스트 신청입니다"
  }'
```

### 3. 웹사이트 테스트

1. 배포된 URL 접속
2. `매입신청` 섹션으로 스크롤
3. 테스트 데이터 입력:
   - 상품권 종류: 현대백화점
   - 금액: 100000
   - 성함: 테스트
   - 연락처: 010-1234-5678
   - 계좌: 우리은행 1002-123-456789
   - PIN: 1234567890123456 (16자리)
4. `매입 신청하기` 버튼 클릭
5. 성공 메시지 확인

## 📊 6단계: 모니터링

### Supabase 대시보드

1. **Database > Tables**
   - 실시간 데이터 확인
   - 매입 신청 현황

2. **Edge Functions > Logs**
   - 함수 실행 로그
   - 오류 추적

3. **Authentication > Users**
   - 관리자 사용자 관리

### 통계 뷰 확인

```sql
-- 일일 통계
SELECT * FROM daily_stats ORDER BY date DESC LIMIT 7;

-- 브랜드별 통계
SELECT * FROM brand_stats;
```

## 🔒 7단계: 보안 강화 (선택사항)

### 1. IP 화이트리스트 설정

```sql
-- IP 제한 정책 추가 예시
CREATE POLICY "Restrict by IP"
ON public.purchase_requests
FOR INSERT
USING (
  inet_client_addr() << inet 'YOUR_OFFICE_IP/32'
);
```

### 2. Rate Limiting 설정

Supabase 대시보드:
- Settings → API → Rate Limiting

### 3. 환경 변수 보안

- `.env.local` 파일을 `.gitignore`에 추가 (완료)
- 프로덕션 환경에서는 환경 변수 사용

## 📝 8단계: 다음 단계

### 필수 작업

1. **실제 PIN 검증 API 연동**
   - 현대백화점, 롯데, 신세계 등 각 브랜드 API 연동
   - `verify-pin` Edge Function 구현

2. **실제 입금 시스템 연동**
   - 은행 API 또는 PG사 연동
   - 자동 입금 처리

3. **관리자 대시보드 구축**
   - 매입 신청 관리
   - 거래 내역 조회
   - 통계 대시보드

### 선택 작업

1. **알림 시스템**
   - 이메일 알림
   - SMS 알림
   - 슬랙/텔레그램 알림

2. **고급 보안**
   - 2단계 인증
   - 사기 탐지 시스템
   - 이상 거래 감지

3. **성능 최적화**
   - CDN 적용
   - 이미지 최적화
   - 캐싱 전략

## ❓ 문제 해결

### 문제: Edge Function 호출 시 CORS 오류

**해결책**: Edge Function에 CORS 헤더 추가 (이미 적용됨)

### 문제: 데이터베이스 연결 오류

**해결책**:
1. Supabase 프로젝트 URL 확인
2. API 키 재확인
3. RLS 정책 확인

### 문제: PIN 암호화 관련

**현재**: Base64 인코딩 (개발용)
**운영 시**: AES-256 암호화로 업그레이드 필요

## 📞 지원

- Supabase 문서: https://supabase.com/docs
- GitHub Issues: [여기에 이슈 제출]
- 이메일: [support@brothergift.co.kr]

---

**작성일**: 2024-11-16
**버전**: 1.0.0
**작성자**: Claude Code
