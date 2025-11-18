const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  // 페이지 열기
  await page.goto('file://' + __dirname + '/index.html');
  await page.waitForTimeout(1000);

  // 스크린샷 찍기
  await page.screenshot({
    path: 'mobile-screenshot.png',
    fullPage: true
  });

  console.log('✅ 모바일 스크린샷 저장 완료: mobile-screenshot.png');

  // 레이아웃 체크
  const header = await page.locator('header');
  const headerHeight = await header.boundingBox();
  console.log('📱 헤더 높이:', headerHeight?.height);

  const container = await page.locator('.container').first();
  const containerBox = await container.boundingBox();
  console.log('📦 컨테이너 너비:', containerBox?.width);

  // 오버플로우 체크
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = 390;
  if (bodyWidth > viewportWidth) {
    console.log('⚠️  수평 스크롤 발생 가능 (body width:', bodyWidth, ')');
  } else {
    console.log('✅ 수평 스크롤 없음');
  }

  await browser.close();
})();
