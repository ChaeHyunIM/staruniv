# 티어표 스크롤 성능 최적화 과정

## 문제

모바일에서 티어표 페이지 접속 시 **animated WebP 380개가 동시 디코딩**되면서 CPU 발열과 스크롤 시 UI 멈춤이 발생했다.

---

## 시도 1: `@tanstack/solid-virtual` (per-section virtualizer)

### 접근

`createWindowVirtualizer`로 **티어 섹션별 행(row) 단위 가상화**를 적용했다.

### 실패 원인

15개 섹션 × 별도 virtualizer → `overscan: 3`으로 인해 **섹션당 최소 ~16개 카드**가 항상 렌더. DOM 감소폭이 35~38%에 불과했다.

```
15 sections × 16 cards/section = 240 cards (최소)
```

---

## 시도 2: IntersectionObserver + `<Show>`/`<For>` 조건부 렌더링

### 접근

뷰포트 근처 섹션만 `<Show>`로 카드를 렌더. DOM 카드 수를 72~107개(19~28%)까지 감소시켰다.

### 실패 원인

빠른 스크롤 시 **mount/unmount thrashing** 발생. 섹션이 뷰포트를 연속으로 스쳐 지나가면서 초당 수백~수천 DOM 노드가 생성/파괴되어 메인 스레드를 블로킹했다. debounce 적용으로도 모바일 Safari momentum 스크롤 환경에서는 해결 불가.

---

## 시도 3: DOM 유지 + 이미지 src 토글

### 접근

DOM은 항상 유지하고 IntersectionObserver로 off-screen 이미지의 `src`만 제거/복원하는 방식.

### 실패 원인

animated WebP의 디코딩 자체가 병목이었다. src를 복원하는 순간 디코딩이 재개되므로, rootMargin을 줄이거나 배치 분산을 적용해도 **동시 활성 이미지가 일정 수 이상이면 메인 스레드가 블로킹**되었다.

정적 이미지(picsum.photos)로 교체 테스트 시 렉이 완전히 사라진 것으로 **animated WebP가 근본 원인**임을 확인했다.

---

## 최종 해결: animated WebP → 정적 JPG + CSS/글로벌 최적화

### 근본 원인

프로필 이미지가 외부 CDN(sooplive)의 **animated WebP**였다. 기존 코드에 `.jpg` → `.webp` 변환 함수(`profileWebp`)가 있었으나, DB에 이미 `.webp` 경로가 저장되어 있어 사실상 no-op이었다. 원본 CDN 경로(`.jpg`)를 직접 사용하면 정적 이미지가 제공된다.

### 적용 내용

**1. animated WebP → 정적 JPG 전환 (핵심)**

- `profileWebp()` 함수 제거, `https:${profile_image}` 직접 사용
- 외부 CDN의 `.jpg` 원본은 정적 이미지이므로 디코딩 비용이 극히 낮음

**2. VirtualTierGrid 컴포넌트 제거**

- IO src 토글 로직이 불필요해지면서 컴포넌트의 존재 이유 소멸
- `index.tsx`에 인라인 `<For>` + `.tierGrid` div로 대체
- `clientOnly()` 래핑, 별도 CSS 모듈 모두 제거

**3. `backdrop-filter: blur()` 제거**

- nav: `backdrop-filter: blur(8px)` + 반투명 배경 → opaque `background: var(--card)` + `box-shadow`
- stickyBar: `backdrop-filter: blur(12px)` + 반투명 배경 → opaque `background: var(--background)` + `border-bottom`
- 두 sticky 요소에서 매 프레임 발생하던 GPU 리컴포지트 비용 제거

**4. 글로벌 `scroll-behavior: smooth` 제거**

- `html`의 `scroll-behavior: smooth`가 스크롤 시 메인 스레드 부하를 유발
- TierNavigator는 이미 `el.scrollIntoView({ behavior: "smooth" })`를 직접 사용하므로 영향 없음

**5. `contain-intrinsic-size` 추가**

- `content-visibility: auto`와 함께 `contain-intrinsic-size: auto 220px 66px` 추가
- off-screen 카드의 크기 힌트를 제공하여 스크롤바 떨림 방지
- 값은 `.tierGrid`의 `minmax(220px, 1fr)`과 `grid-auto-rows: 66px` (compact variant) 기준

---

## 접근별 비교 요약

| | tanstack/solid-virtual | IO + Show/For | IO + src 토글 | 정적 JPG (최종) |
|---|---|---|---|---|
| 스크롤 시 DOM 조작 | 행 단위 생성/파괴 | 섹션 단위 생성/파괴 | attribute 변경 | **없음** |
| animated WebP 처리 | DOM 제거로 차단 | DOM 제거로 차단 | src 제거로 차단 | **사용 안 함** |
| 빠른 스크롤 안정성 | thrashing 위험 | thrashing → UI 멈춤 | 디코딩 병목 | **문제 없음** |
| 코드 복잡도 | 높음 (virtualizer) | 중간 (IO + debounce) | 중간 (IO + batch) | **없음 (인라인 For)** |
| 외부 의존성 | @tanstack/solid-virtual | 없음 | 없음 | **없음** |

### 핵심 교훈

- **DOM 가상화나 src 토글은 증상 완화**이고, **animated 이미지 자체가 근본 원인**이었다.
- 외부 CDN 이미지가 animated인지 정적인지를 먼저 확인하는 것이 중요했다. URL 확장자(`.jpg`)와 실제 제공 포맷이 다를 수 있다.
- `backdrop-filter`와 `scroll-behavior: smooth` 같은 CSS 속성도 스크롤 성능에 유의미한 영향을 준다.
