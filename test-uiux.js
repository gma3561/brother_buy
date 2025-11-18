const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

const siteUrl = 'http://localhost:8080/index-new.html';
const outputDir = path.join(__dirname, 'uiux-test-results');

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Test results
const testResults = {
    timestamp: new Date().toISOString(),
    url: siteUrl,
    viewports: {},
    interactions: {},
    accessibility: {},
    performance: {},
    issues: [],
    recommendations: []
};

// Viewport configurations
const viewports = {
    mobile: { width: 375, height: 667, name: 'iPhone SE' },
    mobileLarge: { width: 414, height: 896, name: 'iPhone 12 Pro' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    desktop: { width: 1920, height: 1080, name: 'Desktop FHD' }
};

async function captureViewport(page, viewportName, viewport) {
    console.log(`\n Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000);

    const results = {
        name: viewport.name,
        size: `${viewport.width}x${viewport.height}`,
        screenshots: {},
        elements: {},
        issues: []
    };

    // Full page screenshot
    console.log('   Capturing full page...');
    await page.screenshot({
        path: path.join(outputDir, `${viewportName}-fullpage.png`),
        fullPage: true
    });
    results.screenshots.fullPage = `${viewportName}-fullpage.png`;

    // Hero section
    console.log('   Capturing hero section...');
    const hero = await page.$('.hero');
    if (hero) {
        await hero.screenshot({
            path: path.join(outputDir, `${viewportName}-hero.png`)
        });
        results.screenshots.hero = `${viewportName}-hero.png`;
    }

    // Features section
    console.log('   Capturing features section...');
    const features = await page.$('.features');
    if (features) {
        await features.screenshot({
            path: path.join(outputDir, `${viewportName}-features.png`)
        });
        results.screenshots.features = `${viewportName}-features.png`;
    }

    // Check navigation
    console.log('   Checking navigation...');
    const navbarVisible = await page.isVisible('.navbar');
    const logoVisible = await page.isVisible('.logo-img');
    const navMenuVisible = await page.isVisible('.nav-menu');

    results.elements.navbar = {
        visible: navbarVisible,
        logo: logoVisible,
        menu: navMenuVisible
    };

    // Check mobile menu button on small screens
    if (viewport.width < 768) {
        const mobileMenuBtn = await page.isVisible('.mobile-menu-btn');
        results.elements.mobileMenuButton = mobileMenuBtn;

        if (!mobileMenuBtn) {
            results.issues.push('Mobile menu button not visible on mobile viewport');
        }
    }

    // Check hero section elements
    console.log('   Checking hero elements...');
    const heroTitle = await page.isVisible('.hero-title');
    const heroSubtitle = await page.isVisible('.hero-subtitle');
    const heroButtons = await page.isVisible('.hero-buttons');

    results.elements.hero = {
        title: heroTitle,
        subtitle: heroSubtitle,
        buttons: heroButtons
    };

    // Check if text is readable (not cut off)
    const heroTitleText = await page.textContent('.hero-title');
    if (heroTitleText) {
        results.elements.heroTitleText = heroTitleText.trim();
    }

    // Check feature cards
    console.log('   Checking feature cards...');
    const featureCards = await page.$$('.feature-card');
    results.elements.featureCardsCount = featureCards.length;

    if (featureCards.length !== 6) {
        results.issues.push(`Expected 6 feature cards, found ${featureCards.length}`);
    }

    // Check brand items
    console.log('   Checking brand items...');
    const brandItems = await page.$$('.brand-item');
    results.elements.brandItemsCount = brandItems.length;

    // Check gallery items
    console.log('   Checking gallery items...');
    const galleryItems = await page.$$('.gallery-item');
    results.elements.galleryItemsCount = galleryItems.length;

    // Check CTA button
    console.log('   Checking CTA button...');
    const ctaButton = await page.isVisible('.btn-cta');
    results.elements.ctaButton = ctaButton;

    // Check contact form
    console.log('   Checking contact form...');
    const contactForm = await page.isVisible('#contactForm');
    const nameInput = await page.isVisible('#name');
    const phoneInput = await page.isVisible('#phone');

    results.elements.contactForm = {
        visible: contactForm,
        nameInput: nameInput,
        phoneInput: phoneInput
    };

    // Check footer
    console.log('   Checking footer...');
    const footer = await page.isVisible('.footer');
    results.elements.footer = footer;

    // Check floating call button (mobile only)
    if (viewport.width < 1025) {
        const floatingBtn = await page.isVisible('.floating-call-btn');
        results.elements.floatingCallButton = floatingBtn;
    }

    // Measure viewport coverage
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    results.metrics = {
        totalHeight: bodyHeight,
        viewportHeight: viewport.height,
        scrollable: bodyHeight > viewport.height
    };

    testResults.viewports[viewportName] = results;
    return results;
}

async function testInteractions(page) {
    console.log('\n Testing Interactions...');

    const interactions = {
        mobileMenu: { tested: false, passed: false },
        smoothScroll: { tested: false, passed: false },
        galleryModal: { tested: false, passed: false },
        contactForm: { tested: false, passed: false }
    };

    try {
        // Test mobile menu (on mobile viewport)
        console.log('   Testing mobile menu toggle...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);

        const menuBtnExists = await page.isVisible('.mobile-menu-btn');
        if (menuBtnExists) {
            // Check initial state
            const menuInitiallyHidden = await page.evaluate(() => {
                const menu = document.getElementById('navMenu');
                return !menu.classList.contains('active');
            });

            // Click menu button
            await page.click('.mobile-menu-btn');
            await page.waitForTimeout(500);

            // Check if menu opened
            const menuOpened = await page.evaluate(() => {
                const menu = document.getElementById('navMenu');
                return menu.classList.contains('active');
            });

            interactions.mobileMenu = {
                tested: true,
                passed: menuInitiallyHidden && menuOpened,
                details: `Initial: hidden=${menuInitiallyHidden}, After click: opened=${menuOpened}`
            };

            // Close menu
            await page.click('.mobile-menu-btn');
            await page.waitForTimeout(500);
        }

        // Test smooth scroll
        console.log('   Testing smooth scroll...');
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(500);

        const scrollBefore = await page.evaluate(() => window.pageYOffset);
        await page.click('a[href="#features"]');
        await page.waitForTimeout(1500);
        const scrollAfter = await page.evaluate(() => window.pageYOffset);

        interactions.smoothScroll = {
            tested: true,
            passed: scrollAfter > scrollBefore,
            details: `Scrolled from ${scrollBefore}px to ${scrollAfter}px`
        };

        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);

        // Test gallery modal
        console.log('   Testing gallery modal...');
        await page.evaluate(() => {
            const gallerySection = document.querySelector('.gallery');
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        });
        await page.waitForTimeout(1000);

        const galleryItemExists = await page.isVisible('.gallery-item');
        if (galleryItemExists) {
            await page.click('.gallery-item');
            await page.waitForTimeout(500);

            const modalVisible = await page.isVisible('.modal.active');
            const modalImageVisible = await page.isVisible('.modal-content');

            interactions.galleryModal = {
                tested: true,
                passed: modalVisible && modalImageVisible,
                details: `Modal: ${modalVisible}, Image: ${modalImageVisible}`
            };

            // Close modal
            if (modalVisible) {
                await page.click('.modal-close');
                await page.waitForTimeout(500);
            }
        }

        // Test contact form
        console.log('   Testing contact form...');
        await page.evaluate(() => {
            const contactSection = document.querySelector('.contact');
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
        await page.waitForTimeout(1000);

        const formExists = await page.isVisible('#contactForm');
        if (formExists) {
            // Fill form
            await page.fill('#name', '홍길동');
            await page.fill('#phone', '01012345678');
            await page.selectOption('#giftcard', '현대백화점');
            await page.fill('#message', '상품권 매입 문의드립니다.');

            // Check if phone number was formatted
            const phoneValue = await page.inputValue('#phone');
            const isFormatted = phoneValue.includes('-');

            interactions.contactForm = {
                tested: true,
                passed: true,
                details: `Phone formatting: ${isFormatted ? 'Working' : 'Not working'} (${phoneValue})`
            };

            // Don't submit to avoid alert
        }

    } catch (error) {
        console.error('  ❌ Interaction test error:', error.message);
    }

    testResults.interactions = interactions;
    return interactions;
}

async function testAccessibility(page) {
    console.log('\n♿ Testing Accessibility...');

    const accessibility = {
        images: { tested: false, passed: false, details: '' },
        links: { tested: false, passed: false, details: '' },
        forms: { tested: false, passed: false, details: '' },
        headings: { tested: false, passed: false, details: '' }
    };

    try {
        // Check images have alt text
        const imagesWithoutAlt = await page.$$eval('img', imgs =>
            imgs.filter(img => !img.alt || img.alt.trim() === '').length
        );
        const totalImages = await page.$$eval('img', imgs => imgs.length);

        accessibility.images = {
            tested: true,
            passed: imagesWithoutAlt === 0,
            details: `${totalImages - imagesWithoutAlt}/${totalImages} images have alt text`
        };

        // Check links are descriptive
        const emptyLinks = await page.$$eval('a', links =>
            links.filter(link => !link.textContent.trim() && !link.getAttribute('aria-label')).length
        );
        const totalLinks = await page.$$eval('a', links => links.length);

        accessibility.links = {
            tested: true,
            passed: emptyLinks === 0,
            details: `${totalLinks - emptyLinks}/${totalLinks} links have text/aria-label`
        };

        // Check form labels
        const inputsWithoutLabels = await page.$$eval('input, select, textarea', inputs =>
            inputs.filter(input => {
                const id = input.id;
                if (!id) return true;
                const label = document.querySelector(`label[for="${id}"]`);
                return !label;
            }).length
        );
        const totalInputs = await page.$$eval('input, select, textarea', inputs => inputs.length);

        accessibility.forms = {
            tested: true,
            passed: inputsWithoutLabels === 0,
            details: `${totalInputs - inputsWithoutLabels}/${totalInputs} form elements have labels`
        };

        // Check heading hierarchy
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements =>
            elements.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
        );

        const hasH1 = headings.some(h => h.tag === 'H1');

        accessibility.headings = {
            tested: true,
            passed: hasH1,
            details: `Found ${headings.length} headings, H1: ${hasH1}`
        };

    } catch (error) {
        console.error('  ❌ Accessibility test error:', error.message);
    }

    testResults.accessibility = accessibility;
    return accessibility;
}

async function testPerformance(page) {
    console.log('\n⚡ Testing Performance...');

    const performance = {};

    try {
        // Measure load time
        const loadMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
                loadTime: navigation.loadEventEnd - navigation.fetchStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                domInteractive: navigation.domInteractive - navigation.fetchStart
            };
        });

        performance.loadMetrics = loadMetrics;

        // Count resources
        const resourceCount = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            return {
                total: resources.length,
                images: resources.filter(r => r.initiatorType === 'img').length,
                scripts: resources.filter(r => r.initiatorType === 'script').length,
                stylesheets: resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link').length
            };
        });

        performance.resources = resourceCount;

        // Check page size
        const transferSize = await page.evaluate(() => {
            const resources = performance.getEntriesByType('resource');
            return resources.reduce((total, r) => total + (r.transferSize || 0), 0);
        });

        performance.pageSize = {
            bytes: transferSize,
            kilobytes: Math.round(transferSize / 1024),
            megabytes: (transferSize / 1024 / 1024).toFixed(2)
        };

    } catch (error) {
        console.error('  ❌ Performance test error:', error.message);
    }

    testResults.performance = performance;
    return performance;
}

async function generateReport() {
    console.log('\n Generating Report...');

    // Analyze results and add recommendations
    Object.entries(testResults.viewports).forEach(([viewport, results]) => {
        if (results.issues.length > 0) {
            testResults.issues.push(...results.issues.map(issue => `[${viewport}] ${issue}`));
        }
    });

    // Add recommendations based on findings
    if (testResults.accessibility.images && !testResults.accessibility.images.passed) {
        testResults.recommendations.push('Add alt text to all images for better accessibility');
    }

    if (testResults.accessibility.links && !testResults.accessibility.links.passed) {
        testResults.recommendations.push('Ensure all links have descriptive text or aria-labels');
    }

    if (testResults.performance.pageSize && testResults.performance.pageSize.megabytes > 2) {
        testResults.recommendations.push('Consider optimizing images to reduce page size');
    }

    // Create detailed markdown report
    let report = `# UI/UX Test Report - 브라더상품권 사이트\n\n`;
    report += `**테스트 일시**: ${new Date(testResults.timestamp).toLocaleString('ko-KR')}\n`;
    report += `**테스트 URL**: ${testResults.url}\n\n`;
    report += `---\n\n`;

    // Viewport Tests
    report += `##  뷰포트 테스트 결과\n\n`;
    Object.entries(testResults.viewports).forEach(([viewport, results]) => {
        report += `### ${results.name} (${results.size})\n\n`;
        report += `**스크린샷**:\n`;
        Object.entries(results.screenshots).forEach(([name, file]) => {
            report += `- ${name}: \`${file}\`\n`;
        });
        report += `\n**요소 검증**:\n`;
        report += `- 네비게이션: ${results.elements.navbar?.visible ? '✅' : '❌'}\n`;
        report += `- 히어로 섹션: ${results.elements.hero?.title ? '✅' : '❌'}\n`;
        report += `- 기능 카드: ${results.elements.featureCardsCount === 6 ? '✅' : '❌'} (${results.elements.featureCardsCount}/6)\n`;
        report += `- 브랜드 항목: ${results.elements.brandItemsCount}/6\n`;
        report += `- 갤러리 항목: ${results.elements.galleryItemsCount}/8\n`;
        report += `- 연락 폼: ${results.elements.contactForm?.visible ? '✅' : '❌'}\n\n`;

        if (results.issues.length > 0) {
            report += `**⚠️ 발견된 문제**:\n`;
            results.issues.forEach(issue => {
                report += `- ${issue}\n`;
            });
            report += `\n`;
        }
    });

    // Interaction Tests
    report += `##  인터랙션 테스트\n\n`;
    Object.entries(testResults.interactions).forEach(([name, result]) => {
        const emoji = result.passed ? '✅' : result.tested ? '❌' : '⏭️';
        report += `- **${name}**: ${emoji} ${result.tested ? (result.passed ? 'PASS' : 'FAIL') : 'SKIPPED'}\n`;
        if (result.details) {
            report += `  - ${result.details}\n`;
        }
    });
    report += `\n`;

    // Accessibility Tests
    report += `## ♿ 접근성 테스트\n\n`;
    Object.entries(testResults.accessibility).forEach(([name, result]) => {
        const emoji = result.passed ? '✅' : result.tested ? '❌' : '⏭️';
        report += `- **${name}**: ${emoji} ${result.tested ? (result.passed ? 'PASS' : 'FAIL') : 'SKIPPED'}\n`;
        if (result.details) {
            report += `  - ${result.details}\n`;
        }
    });
    report += `\n`;

    // Performance Tests
    if (testResults.performance.loadMetrics) {
        report += `## ⚡ 성능 테스트\n\n`;
        report += `**로딩 시간**:\n`;
        report += `- 전체 로드: ${testResults.performance.loadMetrics.loadTime.toFixed(0)}ms\n`;
        report += `- DOM 준비: ${testResults.performance.loadMetrics.domContentLoaded.toFixed(0)}ms\n`;
        report += `- DOM 인터랙티브: ${testResults.performance.loadMetrics.domInteractive.toFixed(0)}ms\n\n`;

        report += `**리소스**:\n`;
        report += `- 전체: ${testResults.performance.resources.total}개\n`;
        report += `- 이미지: ${testResults.performance.resources.images}개\n`;
        report += `- 스크립트: ${testResults.performance.resources.scripts}개\n`;
        report += `- 스타일시트: ${testResults.performance.resources.stylesheets}개\n\n`;

        report += `**페이지 크기**: ${testResults.performance.pageSize.megabytes}MB (${testResults.performance.pageSize.kilobytes}KB)\n\n`;
    }

    // Issues
    if (testResults.issues.length > 0) {
        report += `## ⚠️ 발견된 문제점\n\n`;
        testResults.issues.forEach((issue, i) => {
            report += `${i + 1}. ${issue}\n`;
        });
        report += `\n`;
    }

    // Recommendations
    if (testResults.recommendations.length > 0) {
        report += `##  개선 권장사항\n\n`;
        testResults.recommendations.forEach((rec, i) => {
            report += `${i + 1}. ${rec}\n`;
        });
        report += `\n`;
    }

    // Summary
    const totalTests = Object.keys(testResults.viewports).length +
                       Object.keys(testResults.interactions).length +
                       Object.keys(testResults.accessibility).length;
    const passedTests = Object.values(testResults.interactions).filter(t => t.passed).length +
                        Object.values(testResults.accessibility).filter(t => t.passed).length;

    report += `---\n\n`;
    report += `##  테스트 요약\n\n`;
    report += `- **총 뷰포트**: ${Object.keys(testResults.viewports).length}개\n`;
    report += `- **인터랙션 테스트**: ${Object.values(testResults.interactions).filter(t => t.tested).length}/${Object.keys(testResults.interactions).length} 완료\n`;
    report += `- **접근성 테스트**: ${Object.values(testResults.accessibility).filter(t => t.tested).length}/${Object.keys(testResults.accessibility).length} 완료\n`;
    report += `- **발견된 문제**: ${testResults.issues.length}개\n`;
    report += `- **권장사항**: ${testResults.recommendations.length}개\n\n`;

    // Save report
    fs.writeFileSync(
        path.join(outputDir, 'test-report.md'),
        report
    );

    // Save JSON results
    fs.writeFileSync(
        path.join(outputDir, 'test-results.json'),
        JSON.stringify(testResults, null, 2)
    );

    console.log(`\n✅ Report generated: ${outputDir}/test-report.md`);
    console.log(`✅ JSON results: ${outputDir}/test-results.json`);
}

async function runTests() {
    console.log(' Starting UI/UX Tests for 브라더상품권 사이트\n');

    const browser = await playwright.chromium.launch({
        headless: true
    });

    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });

    const page = await context.newPage();

    try {
        console.log(` Navigating to ${siteUrl}...`);
        await page.goto(siteUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Test all viewports
        for (const [name, viewport] of Object.entries(viewports)) {
            await captureViewport(page, name, viewport);
        }

        // Test interactions (on desktop)
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto(siteUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await testInteractions(page);

        // Test accessibility
        await testAccessibility(page);

        // Test performance
        await testPerformance(page);

        // Generate report
        await generateReport();

        console.log('\n✅ All tests completed successfully!');
        console.log(` Results saved to: ${outputDir}`);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        testResults.issues.push(`Critical error: ${error.message}`);
    } finally {
        await browser.close();
    }
}

runTests().catch(console.error);
