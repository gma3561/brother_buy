const playwright = require('playwright');

async function quickTest() {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Loading page...');
        await page.goto('http://localhost:8080/index-new.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        console.log('Page loaded!');

        // Take screenshot
        await page.screenshot({ path: 'quick-test.png', fullPage: true });
        console.log('Screenshot saved: quick-test.png');

        // Check hero title
        const titleExists = await page.$('.hero-title');
        console.log('Hero title exists:', !!titleExists);

        if (titleExists) {
            const titleText = await page.textContent('.hero-title');
            console.log('Hero title text:', titleText.trim());
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

quickTest();
