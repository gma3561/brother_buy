#!/usr/bin/env python3
"""
웹사이트 디자인 레퍼런스 분석 및 이미지 수집 스크립트
"""
import requests
from bs4 import BeautifulSoup
import os
import json
from urllib.parse import urljoin, urlparse
import re
from pathlib import Path

# 웹사이트 URL
WEBSITE_URL = "http://xn--zf0bq3igzd8picsd714b.com/"
# 프레임 내부 실제 URL
FRAME_URL = "https://brothergift.free.nowhosting.kr"

def create_directories():
    """필요한 디렉토리 생성"""
    dirs = ['images', 'css', 'js', 'analysis']
    for dir_name in dirs:
        os.makedirs(dir_name, exist_ok=True)

def download_file(url, filepath):
    """파일 다운로드"""
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"다운로드 실패 {url}: {e}")
        return False

def extract_images(soup, base_url):
    """이미지 URL 추출"""
    images = []
    
    # img 태그
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
        if src:
            full_url = urljoin(base_url, src)
            images.append({
                'url': full_url,
                'alt': img.get('alt', ''),
                'type': 'img_tag'
            })
    
    # CSS 배경 이미지
    for style in soup.find_all('style'):
        if style.string:
            bg_images = re.findall(r'url\(["\']?([^"\']+)["\']?\)', style.string)
            for bg_url in bg_images:
                full_url = urljoin(base_url, bg_url)
                images.append({
                    'url': full_url,
                    'alt': 'CSS background',
                    'type': 'css_background'
                })
    
    # 인라인 스타일
    for elem in soup.find_all(style=True):
        style_attr = elem.get('style', '')
        bg_images = re.findall(r'url\(["\']?([^"\']+)["\']?\)', style_attr)
        for bg_url in bg_images:
            full_url = urljoin(base_url, bg_url)
            images.append({
                'url': full_url,
                'alt': 'Inline style',
                'type': 'inline_style'
            })
    
    return images

def extract_css_files(soup, base_url):
    """CSS 파일 추출"""
    css_files = []
    
    # link 태그의 CSS
    for link in soup.find_all('link', rel='stylesheet'):
        href = link.get('href')
        if href:
            css_files.append(urljoin(base_url, href))
    
    # style 태그의 인라인 CSS
    for style in soup.find_all('style'):
        if style.string:
            css_files.append({
                'type': 'inline',
                'content': style.string
            })
    
    return css_files

def analyze_design(soup, css_files_content=None):
    """디자인 요소 분석"""
    design_analysis = {
        'color_scheme': [],
        'fonts': [],
        'layout_structure': {},
        'components': []
    }
    
    # 색상 추출
    color_patterns = [
        r'#[0-9a-fA-F]{3,6}',
        r'rgb\([^)]+\)',
        r'rgba\([^)]+\)',
        r'hsl\([^)]+\)'
    ]
    
    # HTML 내 인라인 스타일에서 색상 추출
    for style in soup.find_all('style'):
        if style.string:
            for pattern in color_patterns:
                colors = re.findall(pattern, style.string, re.IGNORECASE)
                design_analysis['color_scheme'].extend(colors)
    
    # 인라인 스타일 속성에서 색상 추출
    for elem in soup.find_all(style=True):
        style_attr = elem.get('style', '')
        for pattern in color_patterns:
            colors = re.findall(pattern, style_attr, re.IGNORECASE)
            design_analysis['color_scheme'].extend(colors)
    
    # CSS 파일에서 색상 추출
    if css_files_content:
        for css_content in css_files_content:
            for pattern in color_patterns:
                colors = re.findall(pattern, css_content, re.IGNORECASE)
                design_analysis['color_scheme'].extend(colors)
    
    # 폰트 추출
    for style in soup.find_all('style'):
        if style.string:
            fonts = re.findall(r'font-family:\s*([^;]+)', style.string, re.IGNORECASE)
            design_analysis['fonts'].extend([f.strip() for f in fonts])
    
    # CSS 파일에서 폰트 추출
    if css_files_content:
        for css_content in css_files_content:
            fonts = re.findall(r'font-family:\s*([^;]+)', css_content, re.IGNORECASE)
            design_analysis['fonts'].extend([f.strip() for f in fonts])
    
    # 레이아웃 구조
    design_analysis['layout_structure'] = {
        'header': len(soup.find_all(['header', 'nav'])) > 0,
        'footer': len(soup.find_all('footer')) > 0,
        'main': len(soup.find_all('main')) > 0,
        'sections': len(soup.find_all('section')),
        'articles': len(soup.find_all('article')),
        'divs': len(soup.find_all('div')),
    }
    
    # 주요 컴포넌트
    design_analysis['components'] = {
        'buttons': len(soup.find_all(['button', 'a'], class_=re.compile(r'btn|button'))),
        'forms': len(soup.find_all('form')),
        'cards': len(soup.find_all(class_=re.compile(r'card'))),
        'modals': len(soup.find_all(class_=re.compile(r'modal'))),
    }
    
    return design_analysis

def main():
    print(f"웹사이트 분석 시작: {WEBSITE_URL}")
    
    create_directories()
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # 메인 페이지 가져오기
        main_response = requests.get(WEBSITE_URL, headers=headers, timeout=30, allow_redirects=True)
        main_response.raise_for_status()
        main_soup = BeautifulSoup(main_response.content, 'html.parser')
        
        # 프레임 내부 실제 URL 확인
        frame_src = None
        frame_tag = main_soup.find('frame', {'name': 'noframe'})
        if frame_tag:
            frame_src = frame_tag.get('src')
            print(f"프레임 내부 URL 발견: {frame_src}")
        
        # 실제 콘텐츠가 있는 URL 사용
        target_url = frame_src if frame_src else FRAME_URL
        print(f"\n실제 콘텐츠 분석 시작: {target_url}")
        
        # 실제 콘텐츠 가져오기
        response = requests.get(target_url, headers=headers, timeout=30, allow_redirects=True)
        response.raise_for_status()
        
        print(f"상태 코드: {response.status_code}")
        print(f"최종 URL: {response.url}")
        
        # HTML 파싱
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # HTML 저장
        with open('analysis/index.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        print("HTML 저장 완료: analysis/index.html")
        
        # 이미지 추출 및 다운로드
        print("\n이미지 추출 중...")
        images = extract_images(soup, response.url)
        print(f"발견된 이미지: {len(images)}개")
        
        image_info = []
        for idx, img in enumerate(images):
            url = img['url']
            parsed = urlparse(url)
            filename = os.path.basename(parsed.path) or f"image_{idx}.jpg"
            filepath = f"images/{filename}"
            
            if download_file(url, filepath):
                image_info.append({
                    'filename': filename,
                    'url': url,
                    'alt': img['alt'],
                    'type': img['type']
                })
                print(f"  ✓ {filename}")
        
        # CSS 파일 추출 및 다운로드
        print("\nCSS 파일 추출 중...")
        css_files = extract_css_files(soup, response.url)
        print(f"발견된 CSS: {len(css_files)}개")
        
        css_info = []
        for idx, css in enumerate(css_files):
            if isinstance(css, dict) and css.get('type') == 'inline':
                # 인라인 CSS 저장
                filepath = f"css/inline_{idx}.css"
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(css['content'])
                css_info.append({'filename': f'inline_{idx}.css', 'type': 'inline'})
                print(f"  ✓ inline_{idx}.css (인라인)")
            elif isinstance(css, str):
                # 외부 CSS 파일 다운로드
                parsed = urlparse(css)
                filename = os.path.basename(parsed.path) or f"style_{idx}.css"
                filepath = f"css/{filename}"
                
                if download_file(css, filepath):
                    css_info.append({'filename': filename, 'url': css, 'type': 'external'})
                    print(f"  ✓ {filename}")
        
        # CSS 파일 내용 읽기
        css_files_content = []
        for css_file_info in css_info:
            if css_file_info.get('type') == 'external':
                filepath = f"css/{css_file_info['filename']}"
                if os.path.exists(filepath):
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        css_files_content.append(f.read())
            elif css_file_info.get('type') == 'inline':
                filepath = f"css/{css_file_info['filename']}"
                if os.path.exists(filepath):
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        css_files_content.append(f.read())
        
        # 디자인 분석
        print("\n디자인 분석 중...")
        design_analysis = analyze_design(soup, css_files_content)
        
        # 결과 저장
        results = {
            'website_url': WEBSITE_URL,
            'frame_url': target_url,
            'final_url': response.url,
            'images': image_info,
            'css_files': css_info,
            'design_analysis': design_analysis,
            'html_structure': {
                'title': soup.title.string if soup.title else None,
                'meta_description': soup.find('meta', attrs={'name': 'description'}).get('content') if soup.find('meta', attrs={'name': 'description'}) else None,
                'headings': {
                    'h1': len(soup.find_all('h1')),
                    'h2': len(soup.find_all('h2')),
                    'h3': len(soup.find_all('h3')),
                }
            }
        }
        
        with open('analysis/design_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print("\n=== 분석 결과 ===")
        print(f"이미지: {len(image_info)}개 다운로드 완료")
        print(f"CSS 파일: {len(css_info)}개 다운로드 완료")
        print(f"색상: {len(set(design_analysis['color_scheme']))}개 고유 색상")
        print(f"폰트: {len(set(design_analysis['fonts']))}개 폰트 패밀리")
        print("\n결과 저장 위치:")
        print("  - analysis/design_analysis.json")
        print("  - analysis/index.html")
        print("  - images/ (이미지 파일들)")
        
    except requests.exceptions.RequestException as e:
        print(f"웹사이트 접근 오류: {e}")
        print("\n대안: 로컬 HTML 파일이 있으시면 제공해주세요.")
    except Exception as e:
        print(f"오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

