import { createSignal, For, Show, onCleanup, type Accessor } from "solid-js";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TIER_ORDER, type Tier, type PlayerWithCrew } from "~/lib/types";
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
  const [dragTier, setDragTier] = createSignal<Tier | null>(null);
  const [dropTarget, setDropTarget] = createSignal<{ tier: Tier; position: "before" | "after" } | null>(null);

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
            description: "점 모양 핸들을 드래그해서 티어 표시 순서를 자유롭게 바꿀 수 있어요",
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

  /* ── Keyboard: Escape closes ── */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) setIsOpen(false);
  };

  if (typeof document !== "undefined") {
    document.addEventListener("keydown", handleKeyDown);
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
  }

  /* ── Toggle panel ── */
  const togglePanel = () => {
    const opening = !isOpen();
    setIsOpen(opening);
    if (opening) startTour();
  };

  /* ── Scroll to tier section ── */
  const scrollToTier = (tier: Tier) => {
    const el = document.getElementById(`tier-${tier}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  /* ── Drag & Drop handlers ── */
  const handleDragStart = (tier: Tier, e: DragEvent) => {
    setDragTier(tier);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", tier);
    }
  };

  const handleDragOver = (tier: Tier, e: DragEvent) => {
    if (!dragTier()) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropTarget({ tier, position: e.clientY < midY ? "before" : "after" });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const drag = dragTier();
    const drop = dropTarget();
    if (!drag || !drop || drag === drop.tier) {
      setDragTier(null);
      setDropTarget(null);
      return;
    }

    const tiers = [...props.tiers()];
    const fromIndex = tiers.indexOf(drag);
    if (fromIndex === -1) return;

    tiers.splice(fromIndex, 1);

    let toIndex = tiers.indexOf(drop.tier);
    if (toIndex === -1) return;
    if (drop.position === "after") toIndex++;

    tiers.splice(toIndex, 0, drag);
    props.onReorder(tiers);

    setDragTier(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragTier(null);
    setDropTarget(null);
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
        <div class={styles.backdrop} onClick={() => setIsOpen(false)} />
      </Show>

      {/* Panel */}
      <Show when={isOpen()}>
        <div class={styles.panel} role="dialog" aria-label="티어 네비게이터">
          <div class={styles.panelHeader}>
            <h3>티어 순서</h3>
            <button id="tour-reset-btn" class={styles.resetBtn} onClick={handleReset} title="기본 순서로 초기화">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 8a6 6 0 0 1 10.2-4.3M14 8a6 6 0 0 1-10.2 4.3" />
                <path d="M12.5 1v3h-3M3.5 15v-3h3" />
              </svg>
              초기화
            </button>
          </div>

          <div class={styles.tierList}>
            <For each={props.tiers()}>
              {(tier, idx) => {
                const count = () => props.tierData()[tier]?.length ?? 0;
                const isDragging = () => dragTier() === tier;
                const drop = () => dropTarget();
                const isDropBefore = () => drop()?.tier === tier && drop()?.position === "before";
                const isDropAfter = () => drop()?.tier === tier && drop()?.position === "after";
                const isFirst = () => idx() === 0;

                return (
                  <div
                    id={isFirst() ? "tour-tier-item" : undefined}
                    class={styles.tierItem}
                    classList={{
                      [styles.tierItemDragging]: isDragging(),
                      [styles.tierItemDropBefore]: isDropBefore(),
                      [styles.tierItemDropAfter]: isDropAfter(),
                    }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(tier, e)}
                    onDragOver={(e) => handleDragOver(tier, e)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onClick={() => scrollToTier(tier)}
                  >
                    <span
                      id={isFirst() ? "tour-drag-handle" : undefined}
                      class={styles.dragHandle}
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
        class={styles.fab}
        classList={{ [styles.fabOpen]: isOpen() }}
        onClick={togglePanel}
        aria-label={isOpen() ? "네비게이터 닫기" : "티어 네비게이터 열기"}
      >
        <Show
          when={!isOpen()}
          fallback={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 7h18M3 12h18M3 17h18" />
          </svg>
        </Show>
        <span class={styles.fabLabel}>티어 이동</span>
      </button>
    </>
  );
}
