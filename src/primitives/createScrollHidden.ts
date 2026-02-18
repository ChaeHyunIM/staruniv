import { createSignal, onMount, onCleanup } from "solid-js";

/**
 * 스크롤 방향에 따라 숨김 여부를 반환하는 primitive.
 * 아래로 스크롤 → 숨김, 위로 스크롤 → 표시.
 * 페이지 상단(threshold 이내)에서는 항상 표시.
 *
 * @param threshold 이 스크롤 위치 이하에서는 항상 표시 (px)
 * @returns 숨김 여부 accessor
 */
export function createScrollHidden(threshold = 200): () => boolean {
  const [hidden, setHidden] = createSignal(false);

  onMount(() => {
    let lastY = window.scrollY;
    const DELTA = 8; // 미세한 스크롤 무시

    const onScroll = () => {
      const y = window.scrollY;

      if (y < threshold) {
        setHidden(false);
        lastY = y;
        return;
      }

      const diff = y - lastY;
      if (diff > DELTA) {
        setHidden(true);
        lastY = y;
      } else if (diff < -DELTA) {
        setHidden(false);
        lastY = y;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", onScroll));
  });

  return hidden;
}
