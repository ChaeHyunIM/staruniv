# content-visibility 기반 렌더링 최적화

## 개요

200+개의 카드를 렌더링하는 티어표 페이지에서 **DOM 렌더링 성능을 전반적으로 개선**하기 위해 `content-visibility: auto`와 `grid-auto-rows`를 조합한 최적화를 적용했다.

이 최적화는 특정 브라우저 버그 수정이 아니라, 브라우저의 렌더링 파이프라인(Style → Layout → Paint → Composite) 각 단계에서 **불필요한 작업을 건너뛰는** 범용적인 기법이다.

### 계기

Safari에서 LayoutToggle(compact ↔ full) 전환 시 심한 렉이 발생하고, 스크롤을 내린 상태에서는 WebKit 렌더 프로세스가 크래시하는 문제가 있었다. 원인을 조사하면서 200+개 카드가 off-screen 포함 전부 reflow에 참여하고 있다는 점을 발견했고, 이를 해결하는 과정에서 `content-visibility: auto`를 도입하게 되었다.

## 최적화 효과

### 초기 페이지 로드
- 뷰포트 밖의 카드와 티어 섹션은 layout/paint를 건너뜀
- 브라우저가 처리해야 할 초기 렌더링 작업량이 대폭 감소
- 체감 First Contentful Paint 개선

### 스크롤 성능
- off-screen 카드가 placeholder 공간만 차지하고, 뷰포트 진입 시 점진적으로 렌더링
- 스크롤 중 layout/paint 대상이 뷰포트 근처 요소로 제한됨
- `contain: layout style paint`(content-visibility가 자동 적용)로 on-screen 카드의 reflow도 요소 내부로 격리

### 레이아웃 전환 (LayoutToggle)
- variant 변경 시 200+개 카드의 class가 동시에 변경되지만, 실제 reflow 대상은 화면에 보이는 카드(~20-30개)로 제한
- 나머지 off-screen 카드는 style recalculation 자체가 뷰포트 진입 시점까지 지연됨
- Safari에서 발생하던 렉과 WebKit 렌더 프로세스 크래시 해결

### 필터/검색
- 필터 적용으로 카드 목록이 변경될 때도 off-screen 요소는 렌더링에서 제외
- reflow 비용이 전체 카드 수가 아닌 화면에 보이는 카드 수에 비례

### 메모리
- off-screen 요소에 `contain: size`가 적용되어 텍스처 메모리 사용량 감소
- 특히 모바일 Safari에서 텍스처 메모리 한계(~256MB)에 도달하는 문제 완화

## 적용 구조

### 1. 카드 — `content-visibility: auto`

```css
/* PlayerCard.module.css */
.compact, .full, .list {
  content-visibility: auto;
}
```

- off-screen 카드의 layout/paint를 건너뜀
- 스크롤 시 뷰포트에 진입하면 점진적으로 렌더링 (placeholder 효과)
- variant 전환 시 실제 reflow 대상이 화면에 보이는 카드(~20-30개)로 제한됨

### 2. Grid — `grid-auto-rows`로 행 높이 확정

```css
/* index.module.css */
.tierGrid                        { grid-auto-rows: 66px; }
.tierGrid[data-variant="full"]   { grid-auto-rows: 172px; }
.tierGrid[data-variant="list"]   { grid-auto-rows: 34px; }

/* 모바일 (max-width: 640px) */
.tierGrid                        { grid-auto-rows: 58px; }
.tierGrid[data-variant="full"]   { grid-auto-rows: 152px; }
```

**이 부분이 핵심.** `content-visibility: auto`는 off-screen 요소의 style recalculation을 defer하기 때문에, 카드에 직접 설정한 `contain-intrinsic-block-size`는 variant 전환 시 이전 variant의 값이 남는 문제가 있다.

`grid-auto-rows`는 **부모 grid(.tierGrid)에 설정**되므로 `content-visibility`의 defer 대상이 아니며, `data-variant` 변경 시 즉시 반영된다. 이로써:

- off-screen 카드의 style이 defer되어도 **grid가 행 높이를 강제**
- variant 전환 시 스크롤 위치 오차 없음
- `contain-intrinsic-block-size`가 카드에 불필요해짐 (grid가 높이를 결정하므로)

### 3. 티어 섹션 — `content-visibility: auto`

```css
/* index.module.css */
.tierSection {
  content-visibility: auto;
  contain-intrinsic-block-size: auto 400px;
}
```

- 화면 밖의 티어 섹션 전체를 rendering에서 제외
- 티어 섹션은 플레이어 수에 따라 높이가 다르므로 `auto` 키워드로 마지막 렌더링된 높이를 캐시

### 4. border 색상 pre-compute

```css
/* global.css :root / .dark */
--border-10: oklch(from var(--border) l c h / 0.1);
--border-15: oklch(from var(--border) l c h / 0.15);
```

- 카드마다 반복되던 `oklch(from var(--border) l c h / 0.1)` 계산을 `:root`에서 1회로 줄임
- style recalculation 시 per-card 색상 연산 제거

## 높이 계산 근거

### Desktop

| variant | 계산 | 높이 |
|---------|------|------|
| compact | border 2 + padding 24 (sp-3 x 2) + content 40 | **66px** |
| full | border 2 + padding 36 (sp-5 + sp-4) + avatar 80 + gap 12 (sp-3) + body 42 | **172px** |
| list | border 2 + padding 8 (sp-1 x 2) + avatar 24 | **34px** |

### Mobile (max-width: 640px)

| variant | 계산 | 높이 |
|---------|------|------|
| compact | border 2 + padding 16 (sp-2 x 2) + content 40 | **58px** |
| full | border 2 + padding 32 (sp-4 x 2) + avatar 64 + gap 12 + body 42 | **152px** |
| list | 동일 | **34px** |

> padding이나 avatar 크기가 변경되면 `grid-auto-rows` 값도 함께 업데이트해야 한다.

## `content-visibility: auto`의 동작 원리

- **on-screen**: `contain: layout style paint` 적용 — 정상 렌더링하되 reflow가 요소 내부로 격리됨
- **off-screen**: `contain: layout style paint size` 적용 — layout/paint를 건너뛰고 `contain-intrinsic-block-size`만큼 공간 확보
- **style deferral**: off-screen 요소의 class/속성이 변경되어도 style recalculation이 뷰포트 진입 시점까지 지연됨. 이 때문에 카드 자체의 `contain-intrinsic-block-size`로는 variant 전환 시 올바른 높이를 보장할 수 없고, 부모 grid의 `grid-auto-rows`로 해결해야 함.

## 브라우저 지원

- `content-visibility: auto` — Safari 17.0+ (2023.09), Chrome 85+, Firefox 125+
- `grid-auto-rows` — 모든 주요 브라우저
- `contain-intrinsic-block-size` — Safari 17.0+, Chrome 95+, Firefox 107+

## 참고 자료

- [content-visibility: 렌더링 성능을 높이는 새로운 CSS 속성 — web.dev](https://web.dev/articles/content-visibility?hl=ko)
- [contain-intrinsic-block-size — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain-intrinsic-block-size)
- [content-visibility — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)
- [CSS Containment — W3C Specification](https://www.w3.org/TR/css-contain-2/)
