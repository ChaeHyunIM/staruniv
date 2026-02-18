import { createSignal, For, Show, type Accessor } from "solid-js";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TIER_ORDER, type Tier, type PlayerWithCrew } from "~/lib/types";
import { createReorderable } from "~/primitives/createReorderable";
import { createFocusTrap } from "~/primitives/createFocusTrap";
import styles from "./TierNavigator.module.css";

// TODO: 유저 인증 시스템 도입 시 투어 완료 상태를 서버 DB(user_preferences)로 마이그레이션
// 현재는 비인증 앱이므로 localStorage 사용 중
const TOUR_KEY = "tierNav:tourDone";

interface TierNavigatorProps {
  tiers: Accessor<Tier[]>;
  onReorder: (tiers: Tier[]) => void;
  tierData: Accessor<Record<string, PlayerWithCrew[]>>;
}

export default function TierNavigator(props: TierNavigatorProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  let panelRef: HTMLDivElement | undefined;
  let fabRef: HTMLButtonElement | undefined;

  const reorderable = createReorderable<Tier>({
    items: props.tiers,
    key: (tier) => tier,
    onReorder: props.onReorder,
  });

  /* ── Guided tour ── */
  const shouldTour = () =>
    typeof localStorage !== "undefined" && !localStorage.getItem(TOUR_KEY);

  const startTour = () => {
    if (!shouldTour()) return;

    const driverObj = driver({
      animate: true,
      overlayColor: "black",
      overlayOpacity: 0.4,
      stagePadding: 6,
      stageRadius: 8,
      allowClose: true,
      popoverClass: "tier-tour-popover",
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: "다음",
      prevBtnText: "이전",
      doneBtnText: "완료",
      onDestroyed: () => {
        localStorage.setItem(TOUR_KEY, "1");
      },
      steps: [
        {
          element: "#tour-tier-item",
          popover: {
            title: "티어 클릭",
            description: "티어를 클릭하면 해당 섹션으로 바로 이동해요",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-drag-handle",
          popover: {
            title: "순서 편집",
            description: "점 모양 핸들을 드래그하거나 Alt+↑↓ 키로 티어 순서를 바꿀 수 있어요",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#tour-reset-btn",
          popover: {
            title: "초기화",
            description: "커스텀 순서를 기본값으로 되돌릴 수 있어요",
            side: "bottom",
            align: "end",
          },
        },
      ],
    });

    // 패널 렌더링 후 약간의 딜레이
    requestAnimationFrame(() => {
      requestAnimationFrame(() => driverObj.drive());
    });
  };

  /* ── Focus trap ── */
  const { focusFirst, restoreFocus } = createFocusTrap({
    container: () => panelRef,
    isActive: isOpen,
    triggerRef: () => fabRef,
    onEscape: () => setIsOpen(false),
  });

  /* ── Toggle panel ── */
  const togglePanel = () => {
    const opening = !isOpen();
    setIsOpen(opening);
    if (opening) {
      startTour();
      requestAnimationFrame(() => focusFirst());
    }
  };

  /* ── Scroll to tier section ── */
  const scrollToTier = (tier: Tier) => {
    const el = document.getElementById(`tier-${tier}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
    restoreFocus();
  };

  /* ── 키보드 reorder 후 포커스 복원 래퍼 ── */
  const handleItemKeyDown = (tier: Tier, e: KeyboardEvent) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    const delta = e.key === "ArrowUp" ? -1 : 1;
    const newIdx = reorderable.move(tier, delta);
    if (newIdx === -1) return;

    /* 이동 후 같은 아이템에 포커스 유지 */
    requestAnimationFrame(() => {
      const items = panelRef?.querySelectorAll<HTMLElement>(`.${styles.tierItem}`);
      items?.[newIdx]?.focus();
    });
  };

  /* ── Reset order ── */
  const handleReset = (e: MouseEvent) => {
    e.stopPropagation();
    props.onReorder([...TIER_ORDER]);
  };

  return (
    <>
      {/* Backdrop */}
      <Show when={isOpen()}>
        <div class={styles.backdrop} aria-hidden="true" onClick={() => setIsOpen(false)} />
      </Show>

      {/* Panel */}
      <Show when={isOpen()}>
        <div ref={panelRef} id="tier-navigator-panel" class={styles.panel} role="dialog" aria-modal="true" aria-label="티어 네비게이터">
          <div class={styles.panelHeader}>
            <h3>티어 순서</h3>
            <button id="tour-reset-btn" class={styles.resetBtn} onClick={handleReset} title="기본 순서로 초기화">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M2 8a6 6 0 0 1 10.2-4.3M14 8a6 6 0 0 1-10.2 4.3" />
                <path d="M12.5 1v3h-3M3.5 15v-3h3" />
              </svg>
              초기화
            </button>
          </div>

          <div class={styles.tierList} role="listbox" aria-label="티어 순서 목록">
            <For each={props.tiers()}>
              {(tier, idx) => {
                const count = () => props.tierData()[tier]?.length ?? 0;
                const state = reorderable.itemState(tier);
                const handlers = reorderable.itemHandlers(tier);
                const isFirst = () => idx() === 0;

                return (
                  <div
                    id={isFirst() ? "tour-tier-item" : undefined}
                    class={styles.tierItem}
                    classList={{
                      [styles.tierItemDragging]: state.isDragging,
                      [styles.tierItemDropBefore]: state.dropIndicator === "before",
                      [styles.tierItemDropAfter]: state.dropIndicator === "after",
                    }}
                    role="option"
                    tabIndex={0}
                    aria-label={`${tier}${count() > 0 ? ` ${count()}명` : ""} — Alt+화살표로 순서 변경`}
                    draggable={handlers.draggable}
                    onDragStart={handlers.onDragStart}
                    onDragOver={handlers.onDragOver}
                    onDragLeave={handlers.onDragLeave}
                    onDrop={handlers.onDrop}
                    onDragEnd={handlers.onDragEnd}
                    onKeyDown={(e) => handleItemKeyDown(tier, e)}
                    onClick={() => scrollToTier(tier)}
                  >
                    <span
                      id={isFirst() ? "tour-drag-handle" : undefined}
                      class={styles.dragHandle}
                      aria-hidden="true"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5.5" cy="3.5" r="1.5" />
                        <circle cx="10.5" cy="3.5" r="1.5" />
                        <circle cx="5.5" cy="8" r="1.5" />
                        <circle cx="10.5" cy="8" r="1.5" />
                        <circle cx="5.5" cy="12.5" r="1.5" />
                        <circle cx="10.5" cy="12.5" r="1.5" />
                      </svg>
                    </span>
                    <span class={styles.tierName} data-tier={tier}>
                      {tier}
                    </span>
                    <Show when={count() > 0}>
                      <span class={styles.tierCount}>{count()}명</span>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* FAB */}
      <button
        ref={fabRef}
        class={styles.fab}
        classList={{ [styles.fabOpen]: isOpen() }}
        onClick={togglePanel}
        aria-label={isOpen() ? "네비게이터 닫기" : "티어 네비게이터 열기"}
        aria-expanded={isOpen()}
        aria-controls="tier-navigator-panel"
      >
        <Show
          when={!isOpen()}
          fallback={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </Show>
        <span class={styles.fabLabel}>티어 이동</span>
      </button>
    </>
  );
}
