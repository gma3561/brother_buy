# 브라더상품권 웹사이트 디자인 레퍼런스 요약

##  프로젝트 개요
- **웹사이트**: 브라더상품권 (BrotherGiftCard)
- **URL**: http://브라더상품권.com / https://brothergift.free.nowhosting.kr
- **분석일**: 2025년 11월 12일
- **비즈니스**: 압구정/신사동 백화점 상품권 매매 전문

---

##  디자인 시스템

### 컬러 팔레트

#### Primary Colors (주요 색상)
```css
/* Gold/Brown - 브랜드 컬러 */
--primary-gold: rgb(218, 165, 73);

/* Dark - 배경 */
--dark-bg: rgb(58, 50, 52);

/* Text Colors */
--text-primary: rgb(0, 0, 0);
--text-secondary: rgb(119, 119, 119);
--text-tertiary: rgb(73, 80, 87);
--text-white: rgb(255, 255, 255);
```

#### Supporting Colors
```css
/* Backgrounds */
--bg-white: rgb(255, 255, 255);
--bg-overlay-dark: rgba(0, 0, 0, 0.5);
--bg-overlay-light: rgba(255, 255, 255, 0.4);
--bg-blue: rgb(0, 123, 255);
--bg-navy: rgb(0, 51, 153);

/* Borders */
--border-light: rgba(255, 255, 255, 0.1);
--border-lighter: rgba(255, 255, 255, 0.15);
--border-dark: rgba(0, 0, 0, 0.15);
```

### 타이포그래피

#### Font Families
```css
/* Primary Font - Headings & Body */
font-family: 'Open Sans', sans-serif;

/* Secondary Font - Special Text */
font-family: 'Montserrat', sans-serif;

/* Icon Fonts */
font-family: 'Pe-icon-7-stroke';
font-family: 'Font Awesome 5 Free';
```

#### Font Sizes Scale
```
- 13px, 14px (Small text, captions)
- 15.2px, 16px (Body text)
- 18px, 20px (Large body, small headings)
- 24px, 26px (Medium headings)
- 28.8px, 30px (Large headings)
- 36px, 40px (Extra large headings)
- 50px (Hero headings)
- 70px, 80px (Giant hero headings)
```

#### Font Weights
- 300 (Light)
- 400 (Regular)
- 600 (Semi-bold)
- 700 (Bold)
- 800 (Extra-bold)

---

## ️ 레이아웃 구조

### Page Sections (5개 주요 섹션)

#### 1. Hero Section (히어로 영역)
```
Class: pd-tb-small vh100 flex-bc pos-rel typo-light
Features:
- Full viewport height (100vh)
- Background image with overlay
- Centered content
- Light typography on dark background
```

**Content:**
- H1: "상품권은 브라더상품권"
- H2: "압구정상품권 / 신사동상품권 / 백화점상품권 / 각종상품권"
- CTA Button: "브라더상품권문의"

#### 2. Features Section
```
ID: #features
Class: pos-rel pd-tb-small
```

**Features Grid:**
- 상품권최고가매입
- 신사동백화점상품권
- 압구정상품권전문매장
- 상품권최저가판매
- 현대백화점상품권
- 갤러리아백화점상품권

#### 3. CTA Section (전화번호)
```
Class: pd-tb-small pos-rel
```

**Key Element:**
- Large CTA button with phone number: "매장문의02-541-0656"
- Background image with text overlay

#### 4. Gallery Section
```
ID: #gallery
Class: pos-rel pd-tb-small bg-dark
Background: Dark with image gallery
```

**Image Gallery:**
- 8 앱 스크린샷 이미지 (app-img-01.jpg ~ app-img-08.jpg)
- Pop-up lightbox functionality

#### 5. Price Table Section
```
ID: #excel-price
Features:
- Embedded iframe (likely for live pricing)
- 시세 문의하기 CTA button
```

---

## ️ 이미지 자산

### Logo & Branding
```
logo-light.png (540x200px) - 메인 로고
brand-logo1_light.png ~ brand-logo6_light.png - 파트너 브랜드 로고들
```

### Background Images
```
bg-app-01.jpg (704KB) - Hero section background
bg-app-03.jpg (1.5MB) - Secondary background
```

### App Screenshots
```
app-img-01.jpg ~ app-img-08.jpg (각 130-165KB)
- Mobile app interface screenshots
- Gallery 섹션에서 사용
- Lightbox popup으로 확대 가능
```

### Device Mockup
```
iphone-img-11.png (300x883px)
- iPhone mockup for app showcase
```

### Total Assets
- 19개 이미지 파일
- 총 용량: ~3.7MB

---

##  UI 컴포넌트

### Buttons

#### Primary Button (CTA)
```css
Class: btn btn-default bdr-3 rd-10 large wrap-normal lh-5
Style:
- Large size
- Rounded corners (border-radius: 10px)
- Gold/brown color (default theme)
- Prominent placement
```

#### Secondary Button
```css
Class: btn btn-white mini
Style:
- Small size
- White background
- Light text
- Header placement
```

#### Submit Button
```css
Class: btn solid btn-default block
Type: submit
Style:
- Block-level (full width)
- Solid fill
- Form submission
```

### Navigation

#### Main Menu
```
Class: menu-wrp align-l
Menu Items:
1. 브라더상품권 → #features
2. 압구정상품권 → #private
3. 신사동상품권 → #gallery
4. 상품권 → #testimonials
```

#### Mobile Menu
```
Class: nav-handle
Icon: pe-7s-more
Responsive: Hamburger menu for mobile
```

### Form Elements

#### Contact Form
```
Action: /form-data/formdata.php
Method: GET
Class: form-widget

Fields:
- Name input
- Email input
- Phone input
- Message textarea
- Submit button
```

---

##  반응형 디자인

### Breakpoints

#### Desktop (1024px+)
```css
Default layout
Full-width sections
Large typography
```

#### Tablet (768px - 1024px)
```css
@media (max-width: 1024px)
- Font size reduction (1.6rem → smaller)
- Iframe height: 800px
```

#### Mobile (480px - 768px)
```css
@media (max-width: 768px)
- Further font reduction (1.4rem)
- Iframe height: 900px
- Button padding adjustment
```

#### Small Mobile (< 480px)
```css
@media (max-width: 480px)
- Minimum font sizes (1.2rem)
- Iframe height: 950px
- Compact button sizing
```

### Mobile Optimizations
```
- User-scalable: no
- Maximum-scale: 1.0
- Minimum-scale: 1.0
- Viewport width: device-width
```

---

##  인터랙션 & 애니메이션

### Background Animation
```
Class: vegas-slide-inner vegas-animation-kenburns
Feature: Ken Burns effect on background images
Creates subtle zoom/pan animation
```

### Image Gallery
```
Class: pop-img
Feature: Lightbox popup
Clicking gallery images opens full-size view
```

### Smooth Scrolling
```
Navigation links use anchor (#) scrolling
Smooth transition between sections
```

---

##  스페이싱 시스템

### Padding Classes
```
pd-tb-small: Small top-bottom padding
mr-0: Margin reset (0)
mr-b-4: Margin bottom 4 units
mr-b-30: Margin bottom 30px
mr-b-40: Margin bottom 40px
mr-b-50: Margin bottom 50px
mr-auto: Auto margin
```

### Layout Classes
```
container: Bootstrap container
row: Bootstrap row
col-lg-2: Column (2/12 on large screens)
flex-bc: Flexbox with center alignment
align-items-center: Vertical center alignment
```

---

##  SEO & Meta

### Keywords Focus
```
백화점상품권, 압구정상품권, 신사동상품권
현대상품권, 갤러리아상품권
현대백화점상품권, 갤러리아백화점상품권
롯데상품권, 롯데백화점상품권
신세계상품권, 신세계백화점상품권
```

### Meta Description
```
대한민국 상품권은 브라더상품권!
최고가 매입 최저가 판매!
압구정상품권도 신사동상품권도 브라더상품권입니다!
```

### Social Media
```
OG Image: /images/og.jpg
Twitter Card: summary_large_image
Google Site Verification: ehaVk9DcvZSxUjduXCcKqEG9GtkxiEs-DrhT_VI_ooQ
```

---

##  비즈니스 정보

### 회사명
```
브라더상품권 주식회사
```

### 주소
```
서울특별시 강남구 압구정로 162, 1층 브라더상품권
```

### 연락처
```
매장전화: 02-541-0656
모바일: 010-8188-0656
문의링크: tel:010-8188-0656 (클릭투콜)
```

---

##  디자인 인사이트

### Strengths (강점)
1. **Clear Hierarchy**: 명확한 시각적 계층 구조
2. **Strong CTA**: 전화번호 CTA가 매우 눈에 띔
3. **Mobile-First**: 모바일 최적화가 잘 되어 있음
4. **Brand Colors**: 골드/브라운 컬러가 고급스러운 느낌
5. **Trust Signals**: 백화점 브랜드 로고들이 신뢰감 제공

### Design Patterns
1. **Hero-first Layout**: 첫 화면에 핵심 메시지 강조
2. **Feature Grid**: 6개 주요 서비스를 그리드로 표현
3. **Social Proof**: 파트너 브랜드 로고 전시
4. **Gallery Section**: 앱 스크린샷으로 서비스 증명
5. **Contact Form**: 하단에 문의 폼 배치

### User Journey
```
1. Hero → 첫인상 (상품권 전문)
2. Features → 서비스 소개 (매입/판매)
3. CTA → 전화 연결 유도
4. Gallery → 신뢰 구축 (실제 사례)
5. Contact → 문의 접수
```

---

##  기술 스택

### Framework
```
- Bootstrap Grid System
- Custom CSS Framework
```

### Libraries
```
- Vegas Background Animation
- Font Awesome Icons
- Pe-icon-7-stroke Icons
- Lightbox/Popup Library
- Google Fonts (Open Sans, Montserrat)
```

### Performance
```
- Image Optimization: JPG for photos, PNG for logos
- Lazy Loading: Likely implemented for images
- CDN: External font loading
```

---

##  파일 구조

```
website-reference/
├── README.md                    # 상세 분석 레포트
├── DESIGN_SUMMARY.md           # 이 파일
├── page.html                   # 전체 HTML 소스
├── page-info.json              # 구조화된 데이터
├── stylesheets.json            # CSS 정보
├── fullpage-desktop.png        # 데스크톱 전체 스크린샷
├── fullpage-mobile.png         # 모바일 전체 스크린샷
├── hero-section.png            # 히어로 섹션 스크린샷
└── images/                     # 다운로드된 이미지들
    ├── 0-logo-light.png
    ├── 1-brand-logo1_light.png
    ├── ...
    └── 18-bg-app-03.jpg
```

---

##  재사용 가능한 패턴

### 1. Hero Section Pattern
```html
<section class="vh100 flex-bc pos-rel typo-light">
  <div class="bg-overlay"></div>
  <div class="container">
    <h1 class="title large">Main Message</h1>
    <h2 class="title small">Sub Message</h2>
    <a class="btn btn-white">CTA</a>
  </div>
</section>
```

### 2. Feature Grid Pattern
```html
<section class="pd-tb-small">
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <div class="feature-box">
          <i class="icon"></i>
          <h3>Title</h3>
          <p>Description</p>
        </div>
      </div>
      <!-- Repeat for 6 features -->
    </div>
  </div>
</section>
```

### 3. CTA Button Pattern
```html
<a href="tel:02-541-0656"
   class="btn btn-default bdr-3 rd-10 large">
  매장문의02-541-0656
</a>
```

### 4. Gallery Pattern
```html
<div class="gallery-grid">
  <a href="image.jpg" class="pop-img">
    <img src="thumbnail.jpg" alt="Gallery">
  </a>
  <!-- Repeat for gallery items -->
</div>
```

---

##  구현 추천사항

### For New Brother Project

1. **Color Scheme**
   - Primary: Gold/Brown (#DAA549)
   - Dark: #3A3234
   - 동일한 색상 팔레트 사용으로 브랜드 일관성 유지

2. **Typography**
   - Open Sans for body
   - Montserrat for headings
   - 가독성과 전문성 확보

3. **Layout**
   - Mobile-first responsive design
   - Full-height hero section
   - Feature grid (3 columns on desktop, 1 on mobile)
   - Clear CTA buttons with phone numbers

4. **Components**
   - Large, prominent CTA buttons
   - Brand logo carousel
   - Gallery with lightbox
   - Contact form at bottom

5. **Performance**
   - Optimize images (JPG for photos, PNG for logos)
   - Lazy load images below the fold
   - Minimize CSS/JS bundles
   - Use CDN for fonts and libraries

---

##  Contact Information Reference

```
Company: 브라더상품권 주식회사
Address: 서울특별시 강남구 압구정로 162, 1층
Store Phone: 02-541-0656
Mobile: 010-8188-0656
```

---

*생성일: 2025년 11월 12일*
*분석 도구: Playwright Website Analyzer*
