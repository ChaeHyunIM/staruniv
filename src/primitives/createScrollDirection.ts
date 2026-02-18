import { createSignal, onMount, onCleanup, type Accessor } from "solid-js";

export interface CreateScrollDirectionOptions {
  /** 방향 전환 판정 최소 delta (px). 기본 5 */
  threshold?: number;
  /** sticky 전환 기준이 되는 요소를 반환하는 함수. 이 요소의 자연 위치를 지나기 전에는 항상 visible */
  ref?: () => HTMLElement | undefined;
}

/**
 * 스크롤 방향에 따라 visible 상태를 반환하는 primitive.
 * 위로 스크롤하면 true, 아래로 스크롤하면 false.
 * SSR에서는 항상 true를 반환함.
 */
export function createScrollDirection(
  options?: CreateScrollDirectionOptions,
): Accessor<boolean> {
  const threshold = options?.threshold ?? 5;
  const [visible, setVisible] = createSignal(true);

  onMount(() => {
    let lastY = window.scrollY;

    /* ref가 있으면 해당 요소의 문서 내 절대 위치를 sticky 전환 임계점으로 사용 */
    const el = options?.ref?.();
    const stickyTop = el
      ? el.getBoundingClientRect().top + window.scrollY
      : 0;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (el && y <= stickyTop) {
        /* 아직 ref의 자연 위치를 지나지 않음 → 항상 표시 */
        setVisible(true);
      } else if (delta > threshold) {
        setVisible(false);
      } else if (delta < -threshold) {
        setVisible(true);
      }

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", onScroll));
  });

  return visible;
}
