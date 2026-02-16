import { useSearchParams } from "@solidjs/router";
import { For, createEffect, onMount } from "solid-js";
import styles from "./ViewTabs.module.css";

export type ViewType = "tier" | "players";

const TABS: { id: ViewType; label: string }[] = [
  { id: "tier", label: "티어표" },
  { id: "players", label: "선수 목록" },
];

export default function ViewTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = (): ViewType => (searchParams.view as ViewType) ?? "tier";

  let containerRef!: HTMLDivElement;
  let indicatorRef!: HTMLDivElement;
  const tabRefs = new Map<ViewType, HTMLButtonElement>();

  const updateIndicator = () => {
    const active = tabRefs.get(current());
    if (!active || !indicatorRef || !containerRef) return;

    const containerRect = containerRef.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    indicatorRef.style.width = `${activeRect.width}px`;
    indicatorRef.style.transform = `translateX(${activeRect.left - containerRect.left}px)`;
  };

  onMount(updateIndicator);
  createEffect(updateIndicator);

  const switchTab = (view: ViewType) => {
    setSearchParams({ view: view === "tier" ? undefined : view });
  };

  return (
    <div class={styles.tabs} role="tablist" aria-label="뷰 전환" ref={containerRef}>
      <div class={styles.indicator} ref={indicatorRef} aria-hidden="true" />
      <For each={TABS}>
        {(tab) => (
          <button
            ref={(el) => tabRefs.set(tab.id, el)}
            role="tab"
            class={styles.tab}
            classList={{ [styles.active]: current() === tab.id }}
            aria-selected={current() === tab.id}
            onClick={() => switchTab(tab.id)}
          >
            {tab.label}
          </button>
        )}
      </For>
    </div>
  );
}
