const { test, expect } = require('@playwright/test');

test.describe('브라더상품권 핀매입 페이지 레이아웃 테스트', () => {
    test.beforeEach(async ({ page }) => {
        // 로컬 파일 열기
        await page.goto(`file://${__dirname}/index.html`);
        await page.waitForLoadState('networkidle');
    });

    test('페이지 기본 요소 확인', async ({ page }) => {
        // 타이틀 확인
        await expect(page).toHaveTitle(/브라더상품권/);

        // 로고 확인
        const logo = page.locator('img.logo');
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('alt', '브라더상품권');

        // 로고 텍스트 확인
        const logoText = page.locator('.logo-text');
        await expect(logoText).toBeVisible();
        await expect(logoText).toContainText('브라더상품권');
    });

    test('헤더 연락처 정보 확인', async ({ page }) => {
        // 전화번호 확인
        const phoneNumber = page.locator('.header-contact');
        await expect(phoneNumber).toBeVisible();
        await expect(phoneNumber).toContainText('02-541-0656');

        // 운영시간 확인
        const time = page.locator('.header-time');
        await expect(time).toBeVisible();
        await expect(time).toContainText('평일 09:00 - 18:00');
    });

    test('메인 레이아웃 구조 확인', async ({ page }) => {
        // 메인 래퍼 확인
        const mainWrapper = page.locator('.main-wrapper');
        await expect(mainWrapper).toBeVisible();

        // 폼 섹션 확인
        const formSection = page.locator('.form-section');
        await expect(formSection).toBeVisible();

        // 사이드바 확인
        const sidebar = page.locator('.sidebar');
        await expect(sidebar).toBeVisible();
    });

    test('매입률 카드 확인', async ({ page }) => {
        const rateCard = page.locator('.rate-card');
        await expect(rateCard).toBeVisible();

        // 매입률 값 확인
        const rateValue = page.locator('#currentRate');
        await expect(rateValue).toContainText('96.5%');

        // 매입률 설명 확인
        const rateDesc = page.locator('.rate-desc');
        await expect(rateDesc).toContainText('업계 최고 수준');
    });

    test('실시간 매입 현황 확인', async ({ page }) => {
        // 실시간 매입 현황 카드 확인
        const realtimeCard = page.locator('.realtime-card');
        await expect(realtimeCard).toBeVisible();

        // LIVE 배지 확인
        const liveBadge = page.locator('.live-badge');
        await expect(liveBadge).toBeVisible();
        await expect(liveBadge).toContainText('LIVE');

        // LIVE 점 애니메이션 확인
        const liveDot = page.locator('.live-dot');
        await expect(liveDot).toBeVisible();

        // 오늘 매입 건수 확인
        const todayCount = page.locator('#todayCount');
        await expect(todayCount).toBeVisible();

        // 실시간 리스트 확인 (초기 항목이 추가될 때까지 대기)
        await page.waitForTimeout(1000);
        const realtimeItems = page.locator('.realtime-item');
        await expect(realtimeItems.first()).toBeVisible();

        // 실시간 항목 내용 확인
        const firstItem = realtimeItems.first();
        await expect(firstItem.locator('.realtime-phone')).toContainText('010-');
        await expect(firstItem.locator('.realtime-details')).toBeVisible();
        await expect(firstItem.locator('.realtime-time')).toBeVisible();
    });

    test('특징 카드 확인', async ({ page }) => {
        const features = page.locator('.features');
        await expect(features).toBeVisible();

        // 특징 항목 개수 확인 (3개)
        const featureItems = page.locator('.feature-item');
        await expect(featureItems).toHaveCount(3);

        // 각 특징 항목 확인
        const firstFeature = featureItems.first();
        await expect(firstFeature.locator('.feature-icon')).toBeVisible();
        await expect(firstFeature.locator('.feature-title')).toBeVisible();
        await expect(firstFeature.locator('.feature-desc')).toBeVisible();
    });

    test('상품권 브랜드 그리드 확인', async ({ page }) => {
        const brandGrid = page.locator('.brand-grid');
        await expect(brandGrid).toBeVisible();

        // 브랜드 아이템 개수 확인 (8개)
        const brandItems = page.locator('.brand-item');
        await expect(brandItems).toHaveCount(8);

        // 각 브랜드 아이템에 로고, 이름, 매입률이 표시되어야 함
        const firstBrand = brandItems.first();
        await expect(firstBrand.locator('.brand-logo')).toBeVisible();
        await expect(firstBrand.locator('.brand-name')).toBeVisible();
        await expect(firstBrand.locator('.brand-rate')).toBeVisible();
    });

    test('브랜드 선택 기능 확인', async ({ page }) => {
        const brandItems = page.locator('.brand-item');
        const firstBrand = brandItems.first();

        // 브랜드 클릭
        await firstBrand.click();

        // 선택된 브랜드에 'selected' 클래스가 추가되어야 함
        await expect(firstBrand).toHaveClass(/selected/);

        // 현재 매입률이 업데이트되어야 함
        const currentRate = page.locator('#currentRate');
        await expect(currentRate).toContainText('%');
    });

    test('폼 입력 필드 확인', async ({ page }) => {
        // 핀번호 입력
        const pinInput = page.locator('#pin');
        await expect(pinInput).toBeVisible();
        await expect(pinInput).toHaveAttribute('placeholder', '0000-0000-0000-0000');

        // 금액 입력
        const amountInput = page.locator('#amount');
        await expect(amountInput).toBeVisible();

        // 연락처 입력
        const phoneInput = page.locator('#phone');
        await expect(phoneInput).toBeVisible();
        await expect(phoneInput).toHaveAttribute('placeholder', '010-0000-0000');

        // 계좌 정보 입력
        const accountInput = page.locator('#account');
        await expect(accountInput).toBeVisible();
    });

    test('핀번호 자동 포맷팅 확인', async ({ page }) => {
        const pinInput = page.locator('#pin');

        // 16자리 숫자 입력
        await pinInput.fill('1234567890123456');

        // 자동으로 하이픈이 추가되어야 함
        const value = await pinInput.inputValue();
        expect(value).toBe('1234-5678-9012-3456');
    });

    test('금액 자동 포맷팅 확인', async ({ page }) => {
        const amountInput = page.locator('#amount');

        // 숫자 입력
        await amountInput.fill('100000');

        // 자동으로 천 단위 콤마가 추가되어야 함
        const value = await amountInput.inputValue();
        expect(value).toBe('100,000');
    });

    test('전화번호 자동 포맷팅 확인', async ({ page }) => {
        const phoneInput = page.locator('#phone');

        // 11자리 숫자 입력
        await phoneInput.fill('01012345678');

        // 자동으로 하이픈이 추가되어야 함
        const value = await phoneInput.inputValue();
        expect(value).toBe('010-1234-5678');
    });

    test('실시간 계산 표시 확인', async ({ page }) => {
        // 브랜드 선택
        await page.locator('.brand-item').first().click();

        // 금액 입력
        await page.locator('#amount').fill('100000');

        // 계산 결과가 표시되어야 함
        const calculationDisplay = page.locator('#calculationDisplay');
        await expect(calculationDisplay).toHaveClass(/show/);

        // 계산 값 확인
        const displayAmount = page.locator('#displayAmount');
        await expect(displayAmount).toContainText('100,000원');

        const displayPayment = page.locator('#displayPayment');
        await expect(displayPayment).toContainText('원');
    });

    test('제출 버튼 확인', async ({ page }) => {
        const submitBtn = page.locator('.btn-submit');
        await expect(submitBtn).toBeVisible();
        await expect(submitBtn).toContainText('즉시 매입 신청하기');
    });

    test('푸터 확인', async ({ page }) => {
        const footer = page.locator('.footer');
        await expect(footer).toBeVisible();

        // 전화번호 확인
        const footerContact = page.locator('.footer-contact');
        await expect(footerContact).toBeVisible();
        await expect(footerContact).toContainText('02-541-0656');

        // 운영시간 확인
        const footerTime = page.locator('.footer-time');
        await expect(footerTime).toContainText('평일 09:00 - 18:00');
    });

    test('데스크탑 레이아웃 확인', async ({ page }) => {
        // 데스크탑 사이즈로 설정
        await page.setViewportSize({ width: 1400, height: 900 });

        // 메인 래퍼가 그리드 레이아웃이어야 함
        const mainWrapper = page.locator('.main-wrapper');
        const gridStyles = await mainWrapper.evaluate(el =>
            window.getComputedStyle(el).gridTemplateColumns
        );

        // 두 개의 컬럼이 있어야 함 (폼 + 사이드바)
        expect(gridStyles.split(' ').length).toBe(2);

        // 브랜드 그리드가 4열이어야 함
        const brandGrid = page.locator('.brand-grid');
        const brandGridStyles = await brandGrid.evaluate(el =>
            window.getComputedStyle(el).gridTemplateColumns
        );
        expect(brandGridStyles.split(' ').length).toBe(4);
    });

    test('모바일 레이아웃 확인', async ({ page }) => {
        // 모바일 사이즈로 설정
        await page.setViewportSize({ width: 375, height: 667 });

        // 로고 확인
        const logo = page.locator('.logo');
        await expect(logo).toBeVisible();

        // 메인 래퍼가 1열로 변경되어야 함
        const mainWrapper = page.locator('.main-wrapper');
        const gridStyles = await mainWrapper.evaluate(el =>
            window.getComputedStyle(el).gridTemplateColumns
        );

        // 모바일에서는 1개 컬럼
        expect(gridStyles.split(' ').length).toBe(1);

        // 브랜드 그리드가 2열이어야 함
        const brandGrid = page.locator('.brand-grid');
        const brandGridStyles = await brandGrid.evaluate(el =>
            window.getComputedStyle(el).gridTemplateColumns
        );
        expect(brandGridStyles.split(' ').length).toBe(2);
    });

    test('실시간 매입 현황 자동 업데이트 확인', async ({ page }) => {
        // 초기 항목 개수 확인
        await page.waitForTimeout(1500);

        const initialItems = await page.locator('.realtime-item').count();
        expect(initialItems).toBeGreaterThan(0);

        // 오늘 매입 건수가 증가해야 함
        const initialCount = await page.locator('#todayCount').textContent();
        expect(parseInt(initialCount)).toBeGreaterThan(0);

        // 몇 초 대기 후 새로운 항목이 추가되었는지 확인
        await page.waitForTimeout(6000);

        const newCount = await page.locator('#todayCount').textContent();
        expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
    });

    test('스크린샷 캡처 - 전체 페이지', async ({ page }) => {
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'screenshots/full-page-new.png',
            fullPage: true
        });
    });

    test('스크린샷 캡처 - 데스크탑', async ({ page }) => {
        await page.setViewportSize({ width: 1400, height: 900 });
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'screenshots/desktop-view-new.png',
            fullPage: true
        });
    });

    test('스크린샷 캡처 - 모바일', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: 'screenshots/mobile-view-new.png',
            fullPage: true
        });
    });
});
