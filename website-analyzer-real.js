const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetUrl = 'https://brothergift.free.nowhosting.kr';
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

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      rejectUnauthorized: false
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(filepath, () => {});
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
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
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Take full page screenshot
    console.log('Taking screenshots...');
    await page.screenshot({
      path: path.join(outputDir, 'fullpage-desktop.png'),
      fullPage: true
    });

    // Above the fold screenshot
    await page.screenshot({
      path: path.join(outputDir, 'hero-section.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });

    // Mobile viewport screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, 'fullpage-mobile.png'),
      fullPage: true
    });

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    // Extract page information
    const pageInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: window.location.href,
        meta: {},
        colors: [],
        fonts: [],
        images: [],
        backgroundImages: [],
        links: [],
        structure: {},
        textContent: {},
        buttons: [],
        cssClasses: []
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
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          className: img.className,
          id: img.id,
          title: img.title || ''
        });
      });

      // Extract background images from CSS
      document.querySelectorAll('*').forEach(el => {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            info.backgroundImages.push({
              src: urlMatch[1],
              element: el.tagName,
              className: el.className,
              id: el.id,
              text: el.textContent?.trim().substring(0, 100)
            });
          }
        }
      });

      // Extract links
      document.querySelectorAll('a').forEach(link => {
        info.links.push({
          href: link.href,
          text: link.textContent.trim(),
          className: link.className,
          id: link.id
        });
      });

      // Extract buttons
      document.querySelectorAll('button, .btn, [role="button"], input[type="button"], input[type="submit"]').forEach(btn => {
        info.buttons.push({
          tag: btn.tagName,
          text: btn.textContent?.trim() || btn.value,
          className: btn.className,
          id: btn.id,
          type: btn.type
        });
      });

      // Extract color scheme
      const allElements = document.querySelectorAll('*');
      const colorSet = new Set();
      const bgColorSet = new Set();
      const borderColorSet = new Set();

      allElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.color) colorSet.add(styles.color);
        if (styles.backgroundColor) bgColorSet.add(styles.backgroundColor);
        if (styles.borderColor) borderColorSet.add(styles.borderColor);
      });

      info.colors = {
        text: Array.from(colorSet).filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'),
        background: Array.from(bgColorSet).filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'),
        border: Array.from(borderColorSet).filter(c => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent')
      };

      // Extract fonts
      const fontSet = new Set();
      const fontSizeSet = new Set();
      allElements.forEach(el => {
        const font = window.getComputedStyle(el).fontFamily;
        const fontSize = window.getComputedStyle(el).fontSize;
        if (font) fontSet.add(font);
        if (fontSize) fontSizeSet.add(fontSize);
      });
      info.fonts = {
        families: Array.from(fontSet),
        sizes: Array.from(fontSizeSet).sort((a, b) => parseFloat(a) - parseFloat(b))
      };

      // Page structure
      info.structure = {
        headings: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => ({ text: h.textContent.trim(), class: h.className })),
          h2: Array.from(document.querySelectorAll('h2')).map(h => ({ text: h.textContent.trim(), class: h.className })),
          h3: Array.from(document.querySelectorAll('h3')).map(h => ({ text: h.textContent.trim(), class: h.className })),
          h4: Array.from(document.querySelectorAll('h4')).map(h => ({ text: h.textContent.trim(), class: h.className }))
        },
        sections: Array.from(document.querySelectorAll('section, div[class*="section"], div[id*="section"]')).map(s => ({
          tag: s.tagName,
          className: s.className,
          id: s.id,
          textPreview: s.textContent?.trim().substring(0, 100)
        })),
        navigation: Array.from(document.querySelectorAll('nav, .nav, [role="navigation"]')).map(n => ({
          className: n.className,
          id: n.id,
          items: Array.from(n.querySelectorAll('a')).map(a => a.textContent.trim())
        })),
        forms: Array.from(document.querySelectorAll('form')).map(f => ({
          action: f.action,
          method: f.method,
          className: f.className,
          id: f.id
        }))
      };

      // Extract main text content
      const mainContent = document.querySelector('main, [role="main"], .main, #main, .content, #content, body');
      if (mainContent) {
        const paragraphs = Array.from(mainContent.querySelectorAll('p, div')).map(p => p.textContent.trim()).filter(t => t.length > 20);
        info.textContent.mainParagraphs = paragraphs.slice(0, 20);
      }

      // Extract all unique CSS classes
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.trim()) info.cssClasses.push(cls.trim());
          });
        }
      });
      info.cssClasses = [...new Set(info.cssClasses)];

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

    // Extract CSS
    const stylesheets = await page.evaluate(() => {
      const styles = [];
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        styles.push({ type: 'link', href: link.href });
      });
      document.querySelectorAll('style').forEach(style => {
        styles.push({ type: 'inline', content: style.textContent });
      });
      return styles;
    });

    fs.writeFileSync(
      path.join(outputDir, 'stylesheets.json'),
      JSON.stringify(stylesheets, null, 2)
    );

    // Download images
    const allImages = [...pageInfo.images.map(img => img.src), ...pageInfo.backgroundImages.map(img => img.src)];
    const uniqueImages = [...new Set(allImages)];

    console.log(`Found ${uniqueImages.length} unique images. Downloading...`);

    let downloadCount = 0;
    for (let i = 0; i < uniqueImages.length; i++) {
      const imageUrl = uniqueImages[i];
      try {
        // Skip data URLs
        if (imageUrl.startsWith('data:')) {
          console.log(`Skipping data URL ${i + 1}/${uniqueImages.length}`);
          continue;
        }

        // Make absolute URL
        const absoluteUrl = new URL(imageUrl, targetUrl).href;

        // Create filename
        let filename = path.basename(new URL(absoluteUrl).pathname);
        if (!filename || filename.length < 3) {
          filename = `image-${i}.jpg`;
        }
        filename = `${i}-${filename}`;

        const filepath = path.join(imagesDir, filename);

        console.log(`Downloading ${i + 1}/${uniqueImages.length}: ${filename}`);
        await downloadImage(absoluteUrl, filepath);
        downloadCount++;
      } catch (err) {
        console.error(`Failed to download ${imageUrl}:`, err.message);
      }
    }

    // Generate comprehensive report
    const report = `# Website Reference Report: 브라더상품권

## Site Information
- **URL**: ${pageInfo.url}
- **Title**: ${pageInfo.title}
- **Analysis Date**: ${new Date().toLocaleString('ko-KR')}

---

## Design System Analysis

### Color Palette

#### Text Colors
${pageInfo.colors.text.slice(0, 15).map(c => `- \`${c}\``).join('\n')}
${pageInfo.colors.text.length > 15 ? `\n*(${pageInfo.colors.text.length - 15} more colors)*` : ''}

#### Background Colors
${pageInfo.colors.background.slice(0, 15).map(c => `- \`${c}\``).join('\n')}
${pageInfo.colors.background.length > 15 ? `\n*(${pageInfo.colors.background.length - 15} more colors)*` : ''}

#### Border Colors
${pageInfo.colors.border.slice(0, 10).map(c => `- \`${c}\``).join('\n')}

### Typography

#### Font Families
${pageInfo.fonts.families.map(f => `- ${f}`).join('\n')}

#### Font Sizes Used
${pageInfo.fonts.sizes.slice(0, 20).join(', ')}

---

## Page Structure

### Sections
Total sections/containers: ${pageInfo.structure.sections.length}

${pageInfo.structure.sections.slice(0, 10).map((s, i) => `
#### Section ${i + 1}
- **Tag**: ${s.tag}
- **Class**: ${s.className || '(none)'}
- **ID**: ${s.id || '(none)'}
- **Preview**: ${s.textPreview}
`).join('\n')}

### Navigation
Total navigation elements: ${pageInfo.structure.navigation.length}

${pageInfo.structure.navigation.map((nav, i) => `
#### Navigation ${i + 1}
- **Class**: ${nav.className || '(none)'}
- **ID**: ${nav.id || '(none)'}
- **Menu Items**: ${nav.items.join(', ')}
`).join('\n')}

### Forms
Total forms: ${pageInfo.structure.forms.length}

${pageInfo.structure.forms.map((form, i) => `
#### Form ${i + 1}
- **Action**: ${form.action}
- **Method**: ${form.method}
- **Class**: ${form.className || '(none)'}
`).join('\n')}

---

## Content Hierarchy

### Headings

#### H1 Tags (${pageInfo.structure.headings.h1.length})
${pageInfo.structure.headings.h1.map(h => `- **${h.text}** \`${h.class || ''}\``).join('\n') || '- (None)'}

#### H2 Tags (${pageInfo.structure.headings.h2.length})
${pageInfo.structure.headings.h2.map(h => `- **${h.text}** \`${h.class || ''}\``).join('\n') || '- (None)'}

#### H3 Tags (${pageInfo.structure.headings.h3.length})
${pageInfo.structure.headings.h3.slice(0, 15).map(h => `- **${h.text}** \`${h.class || ''}\``).join('\n') || '- (None)'}
${pageInfo.structure.headings.h3.length > 15 ? `\n*(${pageInfo.structure.headings.h3.length - 15} more)*` : ''}

#### H4 Tags (${pageInfo.structure.headings.h4.length})
${pageInfo.structure.headings.h4.slice(0, 10).map(h => `- **${h.text}** \`${h.class || ''}\``).join('\n') || '- (None)'}

---

## Media Assets

### Images
- **Total img tags**: ${pageInfo.images.length}
- **Background images**: ${pageInfo.backgroundImages.length}
- **Downloaded**: ${downloadCount} images

#### Image Details
${pageInfo.images.slice(0, 10).map((img, i) => `
##### Image ${i + 1}
- **Source**: ${img.src}
- **Alt**: ${img.alt || '(none)'}
- **Dimensions**: ${img.width}x${img.height}px
- **Class**: ${img.className || '(none)'}
- **ID**: ${img.id || '(none)'}
`).join('\n')}

${pageInfo.images.length > 10 ? `\n*See page-info.json for all ${pageInfo.images.length} images*\n` : ''}

#### Background Images
${pageInfo.backgroundImages.slice(0, 10).map((img, i) => `
##### BG Image ${i + 1}
- **Source**: ${img.src}
- **Element**: ${img.element}
- **Class**: ${img.className || '(none)'}
- **Text Content**: ${img.text || '(none)'}
`).join('\n')}

---

## Interactive Elements

### Buttons (${pageInfo.buttons.length})
${pageInfo.buttons.slice(0, 20).map((btn, i) => `
${i + 1}. **${btn.text || '(no text)'}**
   - Tag: ${btn.tag}
   - Class: ${btn.className || '(none)'}
   - Type: ${btn.type || 'N/A'}
`).join('\n')}

### Links (${pageInfo.links.length})
${pageInfo.links.slice(0, 30).map((link, i) => `${i + 1}. [${link.text}](${link.href})${link.className ? ` - \`${link.className}\`` : ''}`).join('\n')}
${pageInfo.links.length > 30 ? `\n*(${pageInfo.links.length - 30} more links)*` : ''}

---

## CSS Classes Used

Total unique classes: ${pageInfo.cssClasses.length}

### Common Classes (first 50)
\`\`\`
${pageInfo.cssClasses.slice(0, 50).join(', ')}
\`\`\`

*See page-info.json for complete list*

---

## Main Content Samples

${pageInfo.textContent.mainParagraphs ? pageInfo.textContent.mainParagraphs.slice(0, 10).map((p, i) => `
### Content Block ${i + 1}
${p}
`).join('\n') : '(No main content extracted)'}

---

## Meta Information
${Object.entries(pageInfo.meta).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

---

## Files Generated

### Screenshots
1. ✅ \`fullpage-desktop.png\` - Complete page (desktop 1920px)
2. ✅ \`fullpage-mobile.png\` - Complete page (mobile 375px)
3. ✅ \`hero-section.png\` - Above the fold section

### Source Files
4. ✅ \`page.html\` - Complete HTML source code
5. ✅ \`page-info.json\` - Detailed structured data (JSON)
6. ✅ \`stylesheets.json\` - CSS stylesheet information

### Assets
7. ✅ \`images/\` - Downloaded images (${downloadCount} files)

### Documentation
8. ✅ \`README.md\` - This comprehensive report

---

## Design Insights

### Layout Patterns
- Sections: ${pageInfo.structure.sections.length}
- Navigation menus: ${pageInfo.structure.navigation.length}
- Forms: ${pageInfo.structure.forms.length}

### Content Strategy
- Heading hierarchy: H1(${pageInfo.structure.headings.h1.length}) → H2(${pageInfo.structure.headings.h2.length}) → H3(${pageInfo.structure.headings.h3.length})
- Call-to-action buttons: ${pageInfo.buttons.length}
- Navigation links: ${pageInfo.links.length}

### Visual Elements
- Images: ${pageInfo.images.length} direct + ${pageInfo.backgroundImages.length} backgrounds
- Color palette: ${pageInfo.colors.text.length} text colors, ${pageInfo.colors.background.length} background colors
- Typography: ${pageInfo.fonts.families.length} font families, ${pageInfo.fonts.sizes.length} font sizes

---

## Next Steps

1. ✅ Review screenshots for visual design patterns
2. ✅ Examine downloaded images in \`images/\` directory
3. ✅ Analyze HTML structure in \`page.html\`
4. ✅ Study detailed data in \`page-info.json\`
5. ✅ Review CSS patterns in \`stylesheets.json\`

---

*Generated by Website Analyzer - ${new Date().toLocaleString('ko-KR')}*
`;

    fs.writeFileSync(path.join(outputDir, 'README.md'), report);

    console.log('\n✅ Analysis complete!');
    console.log(` Results: ${outputDir}`);
    console.log(` Screenshots: ${outputDir}/fullpage-*.png`);
    console.log(`️  Images: ${imagesDir} (${downloadCount} files)`);
    console.log(` Report: ${outputDir}/README.md`);
    console.log(` Data: ${outputDir}/page-info.json`);

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

analyzeWebsite().catch(console.error);
