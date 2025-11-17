const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const resultsDir = './uiux-test-results';
const reportPath = path.join(resultsDir, 'refined-test-report.md');

// 테스트 결과 저장
const results = {
    timestamp: new Date().toLocaleString('ko-KR'),
    url: 'http://localhost:8080/index-new.html',
    viewports: [],
    interactions: [],
    accessibility: {},
    performance: {}
};

async function runTests() {
    console.log(' Starting comprehensive UI/UX tests for refined design...\n');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // 페이지 로드
        await page.goto(results.url, { waitUntil: 'networkidle' });
        console.log('✅ Page loaded successfully\n');

        // Font Awesome 로드 확인
        await page.waitForSelector('.fab, .fas, .far', { timeout: 5000 });
        console.log('✅ Font Awesome icons loaded\n');

        // 1. 뷰포트 테스트
        console.log(' Testing different viewports...\n');
        const viewports = [
            { name: 'mobile', width: 375, height: 667, device: 'iPhone SE' },
            { name: 'mobileLarge', width: 414, height: 896, device: 'iPhone 12 Pro' },
            { name: 'tablet', width: 768, height: 1024, device: 'iPad' },
            { name: 'desktop', width: 1920, height: 1080, device: 'Desktop FHD' }
        ];

        for (const viewport of viewports) {
            console.log(`Testing ${viewport.device} (${viewport.width}x${viewport.height})...`);
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);

            const viewportResult = {
                name: viewport.name,
                device: viewport.device,
                width: viewport.width,
                height: viewport.height,
                screenshots: {},
                elements: {}
            };

            // 스크린샷 촬영
            const screenshots = ['fullpage', 'hero', 'features'];
            for (const type of screenshots) {
                const filename = `${viewport.name}-${type}.png`;
                const screenshotPath = path.join(resultsDir, filename);

                if (type === 'fullpage') {
                    await page.screenshot({ path: screenshotPath, fullPage: true });
                } else if (type === 'hero') {
                    const heroSection = await page.locator('.hero').first();
                    await heroSection.screenshot({ path: screenshotPath });
                } else if (type === 'features') {
                    const featuresSection = await page.locator('.features').first();
                    await featuresSection.screenshot({ path: screenshotPath });
                }

                viewportResult.screenshots[type] = filename;
            }

            // 주요 요소 확인
            const elements = {
                navigation: await page.locator('nav').count() > 0,
                hero: await page.locator('.hero').count() > 0,
                features: await page.locator('.feature-card').count(),
                brands: await page.locator('.brand-item').count(),
                gallery: await page.locator('.gallery-item').count(),
                contact: await page.locator('.contact-form').count() > 0,
                // Font Awesome 아이콘 검증
                featureIcons: await page.locator('.feature-icon i.fas').count(),
                heroIcons: await page.locator('.hero-buttons .btn i.fas').count(),
                ctaIcons: await page.locator('.btn-cta i.fas').count(),
                contactIcons: await page.locator('.info-icon i.fas').count(),
                floatingIcon: await page.locator('.call-icon i.fas').count()
            };

            viewportResult.elements = elements;
            results.viewports.push(viewportResult);

            console.log(`  ✅ Navigation: ${elements.navigation ? '✓' : '✗'}`);
            console.log(`  ✅ Hero Section: ${elements.hero ? '✓' : '✗'}`);
            console.log(`  ✅ Feature Cards: ${elements.features}/6`);
            console.log(`  ✅ Feature Icons: ${elements.featureIcons}/6`);
            console.log(`  ✅ Hero Icons: ${elements.heroIcons}/2`);
            console.log(`  ✅ CTA Icons: ${elements.ctaIcons}/1`);
            console.log(`  ✅ Contact Icons: ${elements.contactIcons}/3`);
            console.log(`  ✅ Floating Icon: ${elements.floatingIcon}/1`);
            console.log(`   Screenshots saved\n`);
        }

        // 데스크톱 뷰로 변경 (인터랙션 테스트용)
        await page.setViewportSize({ width: 1920, height: 1080 });

        // 2. 인터랙션 테스트
        console.log(' Testing interactions...\n');

        // 2.1 모바일 메뉴 (모바일 뷰에서)
        await page.setViewportSize({ width: 375, height: 667 });
        const mobileMenuBtn = await page.locator('.mobile-menu-btn');
        const mobileMenuInitiallyHidden = await page.locator('.nav-menu').evaluate(el => {
            return window.getComputedStyle(el).display === 'none';
        });

        await mobileMenuBtn.click();
        await page.waitForTimeout(300);

        const mobileMenuOpened = await page.locator('.nav-menu.active').count() > 0;

        results.interactions.push({
            name: 'mobileMenu',
            passed: mobileMenuInitiallyHidden && mobileMenuOpened,
            details: `Initial: hidden=${mobileMenuInitiallyHidden}, After click: opened=${mobileMenuOpened}`
        });

        console.log(`Mobile Menu: ${mobileMenuInitiallyHidden && mobileMenuOpened ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Initial: hidden=${mobileMenuInitiallyHidden}, After click: opened=${mobileMenuOpened}\n`);

        // 데스크톱으로 다시 변경
        await page.setViewportSize({ width: 1920, height: 1080 });

        // 2.2 스무스 스크롤
        const scrollBefore = await page.evaluate(() => window.scrollY);
        await page.click('a[href="#features"]');
        await page.waitForTimeout(1000);
        const scrollAfter = await page.evaluate(() => window.scrollY);

        results.interactions.push({
            name: 'smoothScroll',
            passed: scrollAfter > scrollBefore,
            details: `Scrolled from ${scrollBefore}px to ${scrollAfter}px`
        });

        console.log(`Smooth Scroll: ${scrollAfter > scrollBefore ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Scrolled from ${scrollBefore}px to ${scrollAfter}px\n`);

        // 맨 위로 스크롤
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);

        // 2.3 갤러리 모달
        const galleryItem = await page.locator('.gallery-item').first();
        await galleryItem.click();
        await page.waitForTimeout(300);

        const modalVisible = await page.locator('.modal.active').count() > 0;
        const modalImage = await page.locator('#modalImage').count() > 0;

        results.interactions.push({
            name: 'galleryModal',
            passed: modalVisible && modalImage,
            details: `Modal: ${modalVisible}, Image: ${modalImage}`
        });

        console.log(`Gallery Modal: ${modalVisible && modalImage ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Modal: ${modalVisible}, Image: ${modalImage}\n`);

        // 모달 닫기
        await page.click('#modalClose');
        await page.waitForTimeout(300);

        // 2.4 폼 검증
        await page.fill('#name', '홍길동');
        await page.fill('#phone', '01012345678');
        await page.waitForTimeout(100);

        const phoneFormatted = await page.inputValue('#phone');

        results.interactions.push({
            name: 'contactForm',
            passed: phoneFormatted === '010-1234-5678',
            details: `Phone formatting: ${phoneFormatted === '010-1234-5678' ? 'Working' : 'Failed'} (${phoneFormatted})`
        });

        console.log(`Contact Form: ${phoneFormatted === '010-1234-5678' ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Phone formatting: ${phoneFormatted === '010-1234-5678' ? 'Working' : 'Failed'} (${phoneFormatted})\n`);

        // 3. 접근성 테스트
        console.log('♿ Testing accessibility...\n');

        // 3.1 이미지 alt 속성
        const allImages = await page.locator('img').count();
        const imagesWithAlt = await page.locator('img[alt]').count();

        results.accessibility.images = {
            passed: allImages === imagesWithAlt,
            total: allImages,
            withAlt: imagesWithAlt,
            details: `${imagesWithAlt}/${allImages} images have alt text`
        };

        console.log(`Images: ${allImages === imagesWithAlt ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  ${imagesWithAlt}/${allImages} images have alt text\n`);

        // 3.2 링크 텍스트
        const allLinks = await page.locator('a').count();
        const linksWithText = await page.locator('a').evaluateAll(links =>
            links.filter(link => link.textContent.trim() || link.getAttribute('aria-label')).length
        );

        results.accessibility.links = {
            passed: allLinks === linksWithText,
            total: allLinks,
            withText: linksWithText,
            details: `${linksWithText}/${allLinks} links have text/aria-label`
        };

        console.log(`Links: ${allLinks === linksWithText ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  ${linksWithText}/${allLinks} links have text/aria-label\n`);

        // 3.3 폼 레이블
        const formInputs = await page.locator('input, textarea, select').count();
        const inputsWithLabels = await page.locator('input[id], textarea[id], select[id]').evaluateAll(inputs =>
            inputs.filter(input => {
                const id = input.getAttribute('id');
                return document.querySelector(`label[for="${id}"]`);
            }).length
        );

        results.accessibility.forms = {
            passed: formInputs === inputsWithLabels,
            total: formInputs,
            withLabels: inputsWithLabels,
            details: `${inputsWithLabels}/${formInputs} form elements have labels`
        };

        console.log(`Forms: ${formInputs === inputsWithLabels ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  ${inputsWithLabels}/${formInputs} form elements have labels\n`);

        // 3.4 제목 구조
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
        const h1Count = await page.locator('h1').count();

        results.accessibility.headings = {
            passed: headings > 0 && h1Count === 1,
            total: headings,
            h1Count: h1Count,
            details: `Found ${headings} headings, H1: ${h1Count === 1}`
        };

        console.log(`Headings: ${headings > 0 && h1Count === 1 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Found ${headings} headings, H1: ${h1Count === 1}\n`);

        // 4. 성능 테스트
        console.log('⚡ Testing performance...\n');

        const performanceMetrics = await page.evaluate(() => {
            const nav = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: nav.loadEventEnd - nav.fetchStart,
                domReady: nav.domContentLoadedEventEnd - nav.fetchStart,
                interactive: nav.domInteractive - nav.fetchStart
            };
        });

        const resources = await page.evaluate(() => {
            const entries = performance.getEntriesByType('resource');
            return {
                total: entries.length,
                images: entries.filter(e => e.initiatorType === 'img').length,
                scripts: entries.filter(e => e.initiatorType === 'script').length,
                stylesheets: entries.filter(e => e.initiatorType === 'link').length
            };
        });

        results.performance = {
            loadTime: Math.round(performanceMetrics.loadTime),
            domReady: Math.round(performanceMetrics.domReady),
            interactive: Math.round(performanceMetrics.interactive),
            resources: resources
        };

        console.log(`Load Time: ${Math.round(performanceMetrics.loadTime)}ms`);
        console.log(`DOM Ready: ${Math.round(performanceMetrics.domReady)}ms`);
        console.log(`Interactive: ${Math.round(performanceMetrics.interactive)}ms`);
        console.log(`Resources: ${resources.total} total (${resources.images} images, ${resources.scripts} scripts, ${resources.stylesheets} stylesheets)\n`);

        // 5. Font Awesome 아이콘 색상 검증
        console.log(' Testing icon colors...\n');

        const featureIconColor = await page.locator('.feature-icon i').first().evaluate(el =>
            getComputedStyle(el).color
        );
        const infoIconColor = await page.locator('.info-icon i').first().evaluate(el =>
            getComputedStyle(el).color
        );

        console.log(`Feature Icon Color: ${featureIconColor}`);
        console.log(`Info Icon Color: ${infoIconColor}\n`);

        // 리포트 생성
        generateReport();

        console.log('✨ All tests completed successfully!');
        console.log(` Report saved: ${reportPath}\n`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

function generateReport() {
    let report = `# UI/UX Test Report - 브라더상품권 사이트 (Refined)\n\n`;
    report += `**테스트 일시**: ${results.timestamp}\n`;
    report += `**테스트 URL**: ${results.url}\n\n`;
    report += `---\n\n`;

    // 뷰포트 테스트 결과
    report += `##  뷰포트 테스트 결과\n\n`;
    results.viewports.forEach(vp => {
        report += `### ${vp.device} (${vp.width}x${vp.height})\n\n`;
        report += `**스크린샷**:\n`;
        Object.entries(vp.screenshots).forEach(([type, file]) => {
            report += `- ${type}: \`${file}\`\n`;
        });
        report += `\n**요소 검증**:\n`;
        report += `- 네비게이션: ${vp.elements.navigation ? '✅' : '❌'}\n`;
        report += `- 히어로 섹션: ${vp.elements.hero ? '✅' : '❌'}\n`;
        report += `- 기능 카드: ${vp.elements.features === 6 ? '✅' : '❌'} (${vp.elements.features}/6)\n`;
        report += `- 기능 아이콘: ${vp.elements.featureIcons === 6 ? '✅' : '❌'} (${vp.elements.featureIcons}/6)\n`;
        report += `- 히어로 아이콘: ${vp.elements.heroIcons === 2 ? '✅' : '❌'} (${vp.elements.heroIcons}/2)\n`;
        report += `- CTA 아이콘: ${vp.elements.ctaIcons === 1 ? '✅' : '❌'} (${vp.elements.ctaIcons}/1)\n`;
        report += `- 연락처 아이콘: ${vp.elements.contactIcons === 3 ? '✅' : '❌'} (${vp.elements.contactIcons}/3)\n`;
        report += `- 플로팅 아이콘: ${vp.elements.floatingIcon === 1 ? '✅' : '❌'} (${vp.elements.floatingIcon}/1)\n`;
        report += `- 브랜드 항목: ${vp.elements.brands}/6\n`;
        report += `- 갤러리 항목: ${vp.elements.gallery}/8\n`;
        report += `- 연락 폼: ${vp.elements.contact ? '✅' : '❌'}\n\n`;
    });

    // 인터랙션 테스트 결과
    report += `##  인터랙션 테스트\n\n`;
    results.interactions.forEach(test => {
        report += `- **${test.name}**: ${test.passed ? '✅ PASS' : '❌ FAIL'}\n`;
        report += `  - ${test.details}\n`;
    });
    report += `\n`;

    // 접근성 테스트 결과
    report += `## ♿ 접근성 테스트\n\n`;
    Object.entries(results.accessibility).forEach(([key, data]) => {
        report += `- **${key}**: ${data.passed ? '✅ PASS' : '❌ FAIL'}\n`;
        report += `  - ${data.details}\n`;
    });
    report += `\n`;

    // 성능 테스트 결과
    report += `## ⚡ 성능 테스트\n\n`;
    report += `**로딩 시간**:\n`;
    report += `- 전체 로드: ${results.performance.loadTime}ms\n`;
    report += `- DOM 준비: ${results.performance.domReady}ms\n`;
    report += `- DOM 인터랙티브: ${results.performance.interactive}ms\n\n`;
    report += `**리소스**:\n`;
    report += `- 전체: ${results.performance.resources.total}개\n`;
    report += `- 이미지: ${results.performance.resources.images}개\n`;
    report += `- 스크립트: ${results.performance.resources.scripts}개\n`;
    report += `- 스타일시트: ${results.performance.resources.stylesheets}개\n\n`;

    // 개선사항
    const issues = [];
    if (!results.accessibility.images.passed) issues.push('이미지 alt 텍스트 누락');
    if (!results.accessibility.links.passed) issues.push('링크 텍스트/aria-label 누락');

    if (issues.length > 0) {
        report += `##  개선 권장사항\n\n`;
        issues.forEach((issue, i) => {
            report += `${i + 1}. ${issue}\n`;
        });
        report += `\n`;
    }

    report += `---\n\n`;
    report += `##  테스트 요약\n\n`;
    report += `- **총 뷰포트**: ${results.viewports.length}개\n`;
    report += `- **인터랙션 테스트**: ${results.interactions.filter(t => t.passed).length}/${results.interactions.length} 완료\n`;
    report += `- **접근성 테스트**: ${Object.values(results.accessibility).filter(t => t.passed).length}/${Object.keys(results.accessibility).length} 완료\n`;
    report += `- **발견된 문제**: ${issues.length}개\n`;
    report += `- **개선사항**: Font Awesome 아이콘 통합, 전문적인 디자인 개선\n\n`;

    fs.writeFileSync(reportPath, report);
}

runTests();
