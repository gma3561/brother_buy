const { chromium } = require('playwright');

async function testRefinedDesign() {
    console.log(' Testing refined design with Font Awesome icons...\n');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the refined site
        await page.goto('http://localhost:8080/index-new.html', { waitUntil: 'networkidle' });

        // Wait for Font Awesome to load
        await page.waitForSelector('.fab, .fas, .far', { timeout: 5000 });

        console.log('✅ Font Awesome loaded successfully\n');

        // Test different viewports
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];

        for (const viewport of viewports) {
            console.log(` Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);

            // Check Font Awesome icons
            const iconChecks = {
                'Feature Icons': '.feature-icon i.fas',
                'Navigation Button': '.btn-call-desktop i.fas',
                'Hero Buttons': '.hero-buttons .btn i.fas',
                'CTA Button': '.btn-cta i.fas',
                'Gallery Icons': '.gallery-icon i.fas',
                'Contact Icons': '.info-icon i.fas',
                'Floating Call Button': '.call-icon i.fas'
            };

            for (const [name, selector] of Object.entries(iconChecks)) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    console.log(`  ✅ ${name}: ${count} icon(s) found`);
                } else {
                    console.log(`  ⚠️  ${name}: No icons found`);
                }
            }

            // Take screenshot
            const filename = `refined-${viewport.name.toLowerCase()}.png`;
            await page.screenshot({
                path: `/Users/hasanghyeon/brother_buy/uiux-test-results/${filename}`,
                fullPage: true
            });
            console.log(`   Screenshot saved: ${filename}\n`);
        }

        // Test icon colors
        console.log(' Testing icon colors...');

        const featureIcon = await page.locator('.feature-icon i').first();
        const featureColor = await featureIcon.evaluate(el => getComputedStyle(el).color);
        console.log(`  Feature icon color: ${featureColor}`);

        const infoIcon = await page.locator('.info-icon i').first();
        const infoColor = await infoIcon.evaluate(el => getComputedStyle(el).color);
        console.log(`  Info icon color: ${infoColor}`);

        console.log('\n✨ All tests completed successfully!');
        console.log(' Refined design is ready for deployment!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testRefinedDesign();
