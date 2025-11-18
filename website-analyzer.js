const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetUrl = 'http://xn--zf0bq3igzd8picsd714b.com/';
const outputDir = path.join(__dirname, 'website-reference');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imagesDir = path.join(outputDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {}); // Delete the file
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function analyzeWebsite() {
  console.log('Starting website analysis...');

  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Take full page screenshot
    console.log('Taking screenshots...');
    await page.screenshot({
      path: path.join(outputDir, 'fullpage-desktop.png'),
      fullPage: true
    });

    // Mobile viewport screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(outputDir, 'fullpage-mobile.png'),
      fullPage: true
    });

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: window.location.href,
        meta: {},
        colors: [],
        fonts: [],
        images: [],
        links: [],
        structure: {},
        styles: {}
      };

      // Meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          info.meta[name] = content;
        }
      });

      // Extract all images
      document.querySelectorAll('img').forEach((img, index) => {
        info.images.push({
          index,
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height,
          className: img.className,
          id: img.id
        });
      });

      // Extract background images from CSS
      document.querySelectorAll('*').forEach(el => {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            info.images.push({
              type: 'background',
              src: urlMatch[1],
              element: el.tagName,
              className: el.className,
              id: el.id
            });
          }
        }
      });

      // Extract links
      document.querySelectorAll('a').forEach(link => {
        info.links.push({
          href: link.href,
          text: link.textContent.trim(),
          className: link.className
        });
      });

      // Extract color scheme
      const allElements = document.querySelectorAll('*');
      const colorSet = new Set();
      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.color) colorSet.add(styles.color);
        if (styles.backgroundColor) colorSet.add(styles.backgroundColor);
      });
      info.colors = Array.from(colorSet).filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent');

      // Extract fonts
      const fontSet = new Set();
      allElements.forEach(el => {
        const font = window.getComputedStyle(el).fontFamily;
        if (font) fontSet.add(font);
      });
      info.fonts = Array.from(fontSet);

      // Page structure
      info.structure = {
        headings: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
        },
        sections: Array.from(document.querySelectorAll('section, div[class*="section"]')).length,
        navigation: Array.from(document.querySelectorAll('nav')).length,
        forms: Array.from(document.querySelectorAll('form')).length
      };

      return info;
    });

    // Save page info
    fs.writeFileSync(
      path.join(outputDir, 'page-info.json'),
      JSON.stringify(pageInfo, null, 2)
    );

    // Extract and save HTML
    const html = await page.content();
    fs.writeFileSync(path.join(outputDir, 'page.html'), html);

    // Download images
    console.log(`Found ${pageInfo.images.length} images. Downloading...`);
    const uniqueImages = [...new Set(pageInfo.images.map(img => img.src))];

    for (let i = 0; i < uniqueImages.length; i++) {
      const imageUrl = uniqueImages[i];
      try {
        // Skip data URLs
        if (imageUrl.startsWith('data:')) continue;

        // Make absolute URL
        const absoluteUrl = new URL(imageUrl, targetUrl).href;
        const filename = `image-${i}-${path.basename(new URL(absoluteUrl).pathname) || 'image.jpg'}`;
        const filepath = path.join(imagesDir, filename);

        console.log(`Downloading ${i + 1}/${uniqueImages.length}: ${filename}`);
        await downloadImage(absoluteUrl, filepath);
      } catch (err) {
        console.error(`Failed to download ${imageUrl}:`, err.message);
      }
    }

    // Generate comprehensive report
    const report = `# Website Reference Report

## Site Information
- **URL**: ${pageInfo.url}
- **Title**: ${pageInfo.title}
- **Analysis Date**: ${new Date().toISOString()}

## Design Overview

### Color Palette
${pageInfo.colors.slice(0, 20).map(c => `- ${c}`).join('\n')}

### Typography
${pageInfo.fonts.map(f => `- ${f}`).join('\n')}

### Page Structure
- **Sections**: ${pageInfo.structure.sections}
- **Navigation Menus**: ${pageInfo.structure.navigation}
- **Forms**: ${pageInfo.structure.forms}

### Headings
#### H1 Tags
${pageInfo.structure.headings.h1.map(h => `- ${h}`).join('\n') || '- (None)'}

#### H2 Tags
${pageInfo.structure.headings.h2.map(h => `- ${h}`).join('\n') || '- (None)'}

#### H3 Tags
${pageInfo.structure.headings.h3.slice(0, 10).map(h => `- ${h}`).join('\n') || '- (None)'}
${pageInfo.structure.headings.h3.length > 10 ? `\n... and ${pageInfo.structure.headings.h3.length - 10} more` : ''}

## Images
Total images found: ${pageInfo.images.length}
Unique images: ${uniqueImages.length}

${pageInfo.images.slice(0, 20).map((img, i) => `
### Image ${i + 1}
- **Source**: ${img.src}
- **Alt Text**: ${img.alt || '(none)'}
- **Type**: ${img.type || 'img tag'}
${img.width ? `- **Dimensions**: ${img.width}x${img.height}` : ''}
${img.className ? `- **Class**: ${img.className}` : ''}
`).join('\n')}

${pageInfo.images.length > 20 ? `\n... and ${pageInfo.images.length - 20} more images (see page-info.json for full list)\n` : ''}

## Navigation Links
${pageInfo.links.slice(0, 30).map((link, i) => `${i + 1}. [${link.text}](${link.href})`).join('\n')}
${pageInfo.links.length > 30 ? `\n... and ${pageInfo.links.length - 30} more links` : ''}

## Meta Information
${Object.entries(pageInfo.meta).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Files Generated
1. \`fullpage-desktop.png\` - Full page screenshot (desktop view)
2. \`fullpage-mobile.png\` - Full page screenshot (mobile view)
3. \`page.html\` - Complete HTML source
4. \`page-info.json\` - Detailed page information in JSON format
5. \`images/\` - Directory containing all downloaded images
6. \`README.md\` - This report

## Next Steps
1. Review screenshots for layout and design patterns
2. Check downloaded images in the \`images/\` directory
3. Analyze HTML source for code structure
4. Review JSON file for detailed technical information
`;

    fs.writeFileSync(path.join(outputDir, 'README.md'), report);

    console.log('\n✅ Analysis complete!');
    console.log(` Results saved to: ${outputDir}`);
    console.log(` Screenshots: ${outputDir}/fullpage-*.png`);
    console.log(`️  Images: ${imagesDir}`);
    console.log(` Report: ${outputDir}/README.md`);

  } catch (error) {
    console.error('Error during analysis:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

analyzeWebsite().catch(console.error);
