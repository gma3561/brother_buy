# 브라더상품권 - 상품권 매입 사이트

이 프로젝트는 브라더상품권 웹사이트의 디자인 레퍼런스를 분석하고, 수집된 이미지와 리소스를 활용하여 상품권 매입 전문 사이트를 제작한 프로젝트입니다.

##  프로젝트 구조

```
brother_buy/
├── index.html                         # 메인 상품권 매입 사이트
├── analysis/                          # 분석 결과
│   ├── index.html                     # 다운로드된 HTML 소스
│   ├── design_analysis.json           # 상세 분석 데이터 (JSON)
│   └── DESIGN_REFERENCE_REPORT.md     # 디자인 레퍼런스 리포트
├── images/                            # 수집된 이미지 파일 (18개)
│   ├── logo-light.png                 # 메인 로고
│   ├── brand-logo1_light.png ~ brand-logo6_light.png  # 브랜드 로고
│   ├── iphone-img-11.png              # iPhone 프레임
│   └── app-img-01.jpg ~ app-img-08.jpg  # 앱 스크린샷
├── css/                               # 수집된 CSS 파일 (20개)
│   ├── bootstrap.css                  # Bootstrap 프레임워크
│   ├── main.css                       # 메인 스타일
│   ├── theme-01.css                   # 테마 스타일
│   ├── custom.css                     # 커스텀 스타일 (신규)
│   └── ...                            # 기타 CSS 파일들
├── analyze_website.py                 # 웹사이트 분석 스크립트
├── requirements.txt                   # Python 패키지 의존성
└── README.md                          # 이 파일
```

##  사용 방법

### 웹사이트 실행

1. **로컬 서버 실행** (Python 사용)
```bash
# Python 3
python3 -m http.server 8000

# 또는 Python 2
python -m SimpleHTTPServer 8000
```

2. **브라우저에서 접속**
```
http://localhost:8000
```

3. **또는 직접 파일 열기**
   - `index.html` 파일을 브라우저로 직접 열어서 확인할 수 있습니다.

### 분석 스크립트 실행 (선택사항)

```bash
source venv/bin/activate
python analyze_website.py
```

##  웹사이트 주요 기능

### 구현된 섹션
1. **히어로 섹션** - 메인 비주얼 및 CTA 버튼
2. **주요 특징** - 안전한 거래, 빠른 입금, 최고의 매입율
3. **매입 가능한 상품권** - 브랜드 로고 갤러리
4. **매입 절차** - 3단계 프로세스 안내
5. **매입율 안내** - 상품권별 매입율 테이블
6. **앱 소개** - 모바일 앱 스크린샷 및 다운로드 링크
7. **상담 신청** - 문의 폼 및 연락처 정보
8. **푸터** - 사이트맵 및 소셜 링크

### 디자인 특징
- **컬러 스킴**: #3a3234 (다크 브라운), #daa549 (골드) 액센트
- **타이포그래피**: "Montserrat" (헤딩), "Open Sans" (본문)
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **애니메이션**: 부드러운 스크롤 및 호버 효과

##  분석 결과 요약

### 수집된 리소스
- **이미지**: 18개
- **CSS 파일**: 20개
- **고유 색상**: 227개
- **폰트 패밀리**: 20개

### 주요 발견사항
- **프레임워크**: Bootstrap 4 기반
- **주요 컬러**: #3a3234 (다크 브라운), #daa549 (골드)
- **주요 폰트**: "Open Sans", "Montserrat"
- **레이아웃**: 섹션 기반, 반응형 디자인

##  상세 분석 리포트

자세한 디자인 레퍼런스 분석은 다음 파일을 참고하세요:
- **[DESIGN_REFERENCE_REPORT.md](analysis/DESIGN_REFERENCE_REPORT.md)**

##  기술 스택

- **Python 3.x**
- **BeautifulSoup4** - HTML 파싱
- **Requests** - HTTP 요청
- **lxml** - XML/HTML 처리

##  라이선스

이 프로젝트는 웹사이트 분석 목적으로 생성되었습니다.

##  문의

분석 결과에 대한 문의사항이 있으시면 이슈를 등록해주세요.

