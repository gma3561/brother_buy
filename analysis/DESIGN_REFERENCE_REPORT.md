# 브라더상품권 웹사이트 디자인 레퍼런스 분석 리포트

##  개요

- **웹사이트 URL**: http://xn--zf0bq3igzd8picsd714b.com/
- **실제 콘텐츠 URL**: https://brothergift.free.nowhosting.kr
- **사이트 제목**: 상품권은 브라더상품권 - 압구정상품권/신사동상품권
- **분석 일시**: 2025년

---

##  색상 팔레트

### 주요 색상 (227개 고유 색상 발견)

#### 프라이머리 컬러
- **#007bff** - Bootstrap Primary Blue (주요 액션 버튼, 링크)
- **#0056b3** - Primary Dark Blue (호버 상태)
- **#0062cc** - Primary Hover

#### 세컨더리 컬러
- **#6c757d** - Bootstrap Secondary Gray
- **#28a745** - Success Green
- **#dc3545** - Danger Red
- **#ffc107** - Warning Yellow
- **#17a2b8** - Info Cyan

#### 테마 컬러 (theme-01.css 기준)
- **#3a3234** - 다크 브라운 (메인 다크 컬러)
- **#daa549** - 골드/옐로우 (액센트 컬러)
- **#9b8377** - 브라운/베이지
- **#8d6bbd** - 퍼플
- **#f0eced** - 라이트 그레이/아이보리
- **#ffffff** - 화이트
- **#f4f5f5** - 오프화이트

#### 그레이스케일
- **#212529** - 다크 그레이
- **#343a40** - 미디엄 다크 그레이
- **#495057** - 미디엄 그레이
- **#6c757d** - 그레이
- **#dee2e6** - 라이트 그레이
- **#e9ecef** - 매우 라이트 그레이
- **#f8f9fa** - 오프화이트

#### 투명도가 적용된 색상
- **rgba(0, 0, 0, 0.1)** - 검은색 10% 투명도 (그림자, 오버레이)
- **rgba(0, 0, 0, 0.5)** - 검은색 50% 투명도
- **rgba(255, 255, 255, 0.1)** - 흰색 10% 투명도
- **rgba(255, 255, 255, 0.5)** - 흰색 50% 투명도

---

##  타이포그래피

### 폰트 패밀리 (20개 발견)

#### 주요 폰트
1. **"Open Sans", sans-serif** - 본문 텍스트
2. **"Montserrat", sans-serif** - 헤딩, 타이틀
3. **'Rancho', cursive** - 장식용 폰트
4. **-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto** - 시스템 폰트 (폴백)

#### 아이콘 폰트
- **Font Awesome 5 Brands** - 브랜드 아이콘
- **Font Awesome 5 Free** - 일반 아이콘
- **'Pe-icon-7-stroke'** - PE 아이콘
- **'et-line'** - ET Line 아이콘

#### 모노스페이스
- **SFMono-Regular, Menlo, Monaco, Consolas** - 코드, 숫자 표시

---

## ️ 이미지 리소스

### 로고 및 브랜딩 (8개)
1. `logo-light.png` - 메인 로고 (라이트 버전)
2. `brand-logo1_light.png` ~ `brand-logo6_light.png` - 파트너 브랜드 로고 (6개)
3. `logos.png` - 통합 로고 이미지

### 앱 스크린샷 (9개)
1. `iphone-img-11.png` - iPhone 11 프레임 이미지
2. `app-img-01.jpg` ~ `app-img-08.jpg` - 앱 스크린샷 (8개)

**이미지 저장 위치**: `/images/` 디렉토리

---

##  레이아웃 구조

### HTML 구조
- **Header**: ✅ 있음
- **Footer**: ✅ 있음
- **Main**: ❌ 없음
- **Sections**: 5개
- **Articles**: 0개
- **Divs**: 92개

### 헤딩 구조
- **H1**: 1개 (메인 타이틀)
- **H2**: 6개 (섹션 타이틀)
- **H3**: 10개 (서브 섹션 타이틀)

### 컴포넌트
- **Buttons**: 3개
- **Forms**: 1개
- **Cards**: 0개
- **Modals**: 0개

---

##  사용된 CSS 프레임워크 및 라이브러리

### CSS 파일 목록 (20개)

#### 프레임워크
1. **bootstrap.css** - Bootstrap 4 프레임워크
2. **bootstrap-datetimepicker.min.css** - 날짜/시간 선택기

#### UI 컴포넌트
3. **owl.css** / **owl.carousel.min.css** - 캐러셀 슬라이더
4. **swiper.min.css** - Swiper 슬라이더
5. **magnific-popup.css** - 라이트박스/팝업
6. **sweetalert2.min.css** - 알림/모달
7. **vegas.min.css** - 배경 슬라이더
8. **materialize-parallax.css** - 패럴랙스 효과

#### 아이콘 폰트
9. **fontawesome-all.min.css** - Font Awesome 5
10. **pe-icon-7-stroke.css** - PE 아이콘
11. **et-line-font.css** - ET Line 아이콘

#### 애니메이션
12. **animate.css** - CSS 애니메이션

#### 커스텀 스타일
13. **main.css** - 메인 스타일시트
14. **ckav-grids.css** - 그리드 시스템
15. **helper.css** - 유틸리티 클래스
16. **responsive.css** - 반응형 스타일
17. **theme-01.css** - 테마 스타일 (컬러 테마)
18. **template-custom.css** - 템플릿 커스텀 스타일
19. **inline_19.css** - 인라인 스타일

**CSS 저장 위치**: `/css/` 디렉토리

---

##  디자인 특징

### 컬러 스킴
- **다크 테마 기반**: #3a3234 (다크 브라운)을 메인 컬러로 사용
- **골드 액센트**: #daa549 (골드)를 강조 컬러로 활용
- **고급스러운 톤**: 브라운, 베이지, 퍼플 계열의 조화

### 타이포그래피
- **Open Sans**: 가독성 좋은 본문 폰트
- **Montserrat**: 모던한 헤딩 폰트
- **Rancho**: 캐주얼한 장식용 폰트

### 레이아웃
- **섹션 기반 구조**: 5개의 주요 섹션으로 구성
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응
- **그리드 시스템**: Bootstrap + 커스텀 그리드 사용

### 인터랙션
- **슬라이더**: Owl Carousel, Swiper 사용
- **애니메이션**: Animate.css 활용
- **패럴랙스**: Materialize Parallax 효과
- **팝업**: Magnific Popup, SweetAlert2

---

##  파일 구조

```
brother_buy/
├── analysis/
│   ├── index.html              # 다운로드된 HTML
│   ├── design_analysis.json    # 상세 분석 데이터 (JSON)
│   └── DESIGN_REFERENCE_REPORT.md  # 이 리포트
├── images/                     # 다운로드된 이미지 (18개)
│   ├── logo-light.png
│   ├── brand-logo*.png
│   ├── iphone-img-11.png
│   └── app-img-*.jpg
├── css/                        # 다운로드된 CSS (20개)
│   ├── bootstrap.css
│   ├── main.css
│   ├── theme-01.css
│   └── ...
└── analyze_website.py          # 분석 스크립트
```

---

##  디자인 가이드라인 요약

### 컬러 사용 가이드
- **Primary**: #007bff (Bootstrap Blue) 또는 #3a3234 (테마 다크)
- **Accent**: #daa549 (골드)
- **Background**: #ffffff, #f4f5f5, #f0eced
- **Text**: #212529, #3a3234

### 폰트 사용 가이드
- **Headings**: "Montserrat", sans-serif
- **Body**: "Open Sans", sans-serif
- **Decorative**: 'Rancho', cursive

### 컴포넌트 스타일
- Bootstrap 4 기반 컴포넌트 사용
- 커스텀 테마 적용 (theme-01.css)
- 반응형 디자인 필수

---

##  추가 분석 필요 사항

1. **JavaScript 파일**: 현재 CSS만 분석됨, JS 파일 분석 필요
2. **폰트 파일**: 웹폰트 파일 (woff, woff2) 확인 필요
3. **SVG 아이콘**: 인라인 SVG 사용 여부 확인
4. **반응형 브레이크포인트**: 미디어 쿼리 분석 필요

---

##  참고사항

- 이 분석은 2025년 기준으로 수행되었습니다.
- 웹사이트가 업데이트되면 재분석이 필요할 수 있습니다.
- 모든 리소스는 로컬에 다운로드되어 있습니다.
- 상세한 CSS 분석은 각 CSS 파일을 직접 확인하시기 바랍니다.

---

**생성일**: 2025년
**분석 도구**: Python (BeautifulSoup, Requests)



