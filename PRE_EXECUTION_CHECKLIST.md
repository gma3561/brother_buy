# ✅ ALL_IN_ONE_SETUP.sql 실행 전 체크리스트

## 🎯 목적
판매 사이트 테이블 등 다른 데이터를 보호하면서 안전하게 매입 사이트 DB 설정

---

## 📋 필수 확인 단계 (순서대로)

### ✅ 1단계: 전체 테이블 목록 확인

**실행:**
```bash
open supabase/migrations/check_current_db.sql
```
→ Supabase SQL Editor에 복사 & 붙여넣기 → **RUN**

**확인할 것:**
- [ ] 현재 테이블이 몇 개 있나?
- [ ] 각 테이블에 데이터가 몇 개 있나?
- [ ] 판매 관련 테이블이 있나? (sales_*, sell_*, customers, products 등)

---

### ✅ 2단계: 외래 키 관계 확인

**실행:**
```bash
open supabase/migrations/check_foreign_keys.sql
```
→ Supabase SQL Editor에 복사 & 붙여넣기 → **RUN**

**확인할 것:**
- [ ] 다른 테이블이 매입 테이블(giftcard_brands, purchase_requests, transactions)을 참조하나?
- [ ] "⚠️ 주의 필요" 결과가 있나?

**결과 해석:**
```
✅ 결과 없음 (No rows returned)
   → 안전! 다른 테이블이 영향받지 않음

⚠️ 결과 있음 (예: sales_orders → giftcard_brands)
   → 주의! 외래 키 관계 있음
   → 백업 필수 또는 CASCADE 영향 고려
```

---

### ✅ 3단계: 삭제될 항목 확인

**ALL_IN_ONE_SETUP.sql이 삭제하는 것:**

```
❌ giftcard_brands (테이블)
❌ purchase_requests (테이블)
❌ transactions (테이블)
❌ brand_stats (뷰)
❌ daily_stats (뷰)
❌ update_updated_at_column() (함수)
```

**삭제되지 않는 것:**
```
✅ 위에 없는 모든 테이블/뷰/함수
✅ sales_orders, customers, products 등
✅ 기타 모든 판매 관련 테이블
```

- [ ] 삭제될 테이블에 중요한 데이터가 있나?
- [ ] 백업이 필요한가?

---

## 🛡️ 안전성 판단

### ✅ 안전한 경우 (바로 실행 가능)

**시나리오 A: 매입 테이블만 있음**
```
현재 테이블: giftcard_brands, purchase_requests, transactions만 존재
외래 키: 없음
데이터: 테스트 데이터뿐
→ ALL_IN_ONE_SETUP.sql 바로 실행 ✅
```

**시나리오 B: 판매 테이블 있지만 독립적**
```
현재 테이블:
  - 매입: giftcard_brands, purchase_requests, transactions
  - 판매: sales_orders, customers, products
외래 키: 없음 (서로 독립적)
→ ALL_IN_ONE_SETUP.sql 안전하게 실행 ✅
```

---

### ⚠️ 주의가 필요한 경우

**시나리오 C: 외래 키 관계 있음**
```
외래 키: sales_orders → giftcard_brands
영향: CASCADE로 인해 sales_orders도 영향받을 수 있음
→ 백업 먼저!
→ 외래 키 제거 고려
→ 또는 수동 마이그레이션
```

**시나리오 D: 중요한 데이터 있음**
```
purchase_requests: 실제 고객 신청 100개
transactions: 실제 거래 내역 50개
→ 백업 필수!
→ CSV export 또는 pg_dump
```

---

## 💾 백업 방법 (필요 시)

### 방법 1: Supabase Dashboard (간단)

1. Table Editor 열기
2. 각 테이블 선택
3. **Export → CSV** 클릭
4. 파일 저장

### 방법 2: SQL 쿼리 (전체)

```sql
-- 매입 테이블 전체 백업 확인
SELECT 'giftcard_brands' as table_name, COUNT(*) as row_count FROM giftcard_brands
UNION ALL
SELECT 'purchase_requests', COUNT(*) FROM purchase_requests
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
```

---

## 🚀 실행 결정 트리

```
START
  ↓
[1단계] 테이블 목록 확인
  ↓
판매 테이블 있나?
  ├─ 없음 → [2단계로]
  └─ 있음 → [2단계] 외래 키 확인
              ↓
         외래 키 있나?
           ├─ 없음 → ✅ 안전! 실행 가능
           └─ 있음 → ⚠️ 백업 먼저
  ↓
중요한 데이터 있나?
  ├─ 없음 (테스트뿐) → ✅ 실행
  └─ 있음 (실제 데이터) → 💾 백업 → ✅ 실행
```

---

## ✅ 최종 체크리스트

실행 전 모든 항목 체크:

- [ ] ✅ 1단계 완료: 테이블 목록 확인
- [ ] ✅ 2단계 완료: 외래 키 관계 확인
- [ ] ✅ 3단계 완료: 삭제될 항목 확인
- [ ] 🛡️ 안전성 판단 완료 (위 시나리오 참고)
- [ ] 💾 필요 시 백업 완료
- [ ] ⚠️ ALL_IN_ONE_SETUP.sql이 무엇을 삭제하는지 이해함
- [ ] 🚀 준비 완료! 실행하자!

---

## 🎯 실행 명령

```bash
open supabase/migrations/ALL_IN_ONE_SETUP.sql
```

→ Supabase SQL Editor에 전체 복사 & 붙여넣기
→ **RUN** 버튼 클릭 ▶️

---

## ✅ 실행 후 검증

```bash
open supabase/migrations/verify_setup.sql
```

→ 복사 & 붙여넣기 → **RUN**
→ 모든 항목이 ✅ PASS인지 확인

---

**작성일:** 2024-11-16
**목적:** 안전한 데이터베이스 설정을 위한 사전 확인
