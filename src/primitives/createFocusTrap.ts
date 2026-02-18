import { onMount, onCleanup } from "solid-js";

export interface CreateFocusTrapOptions {
  /** 트랩 대상 컨테이너 ref */
  container: () => HTMLElement | undefined;
  /** 트랩 활성화 여부 (반응형) */
  isActive: () => boolean;
  /** 닫힐 때 포커스를 복원할 트리거 요소 */
  triggerRef?: () => HTMLElement | undefined;
  /** Escape 키로 닫기 콜백 */
  onEscape?: () => void;
}

export interface FocusTrapReturn {
  /** 컨테이너 내 첫 포커서블 요소로 포커스 이동. 패널 오픈 후 rAF 내에서 호출 */
  focusFirst: () => void;
  /** 트리거 요소로 포커스 복원 */
  restoreFocus: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea, [role="button"]';

/**
 * 다이얼로그/drawer/패널에 포커스를 가두는 primitive.
 * - Tab 순환 (첫 ↔ 마지막)
 * - Escape로 닫기 + 포커스 복원
 * - focusFirst()로 초기 포커스, restoreFocus()로 복원
 */
export function createFocusTrap(options: CreateFocusTrapOptions): FocusTrapReturn {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!options.isActive()) return;

    if (e.key === "Escape") {
      options.onEscape?.();
      options.triggerRef?.()?.focus();
      return;
    }

    if (e.key !== "Tab") return;
    const container = options.container();
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
  });

  const focusFirst = () => {
    const container = options.container();
    container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  };

  const restoreFocus = () => {
    options.triggerRef?.()?.focus();
  };

  return { focusFirst, restoreFocus };
}
