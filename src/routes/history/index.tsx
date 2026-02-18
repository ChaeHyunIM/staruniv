import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createMemo } from "solid-js";
import { Title } from "@solidjs/meta";
import { getTournaments } from "~/lib/queries";
import type { TournamentWithCrew } from "~/lib/types";
import styles from "./history.module.css";

export const route = {
  preload: () => getTournaments(),
} satisfies RouteDefinition;

export default function HistoryPage() {
  const tournaments = createAsync(() => getTournaments());

  const groupedByYear = createMemo(() => {
    const data = tournaments();
    if (!data) return [];

    const map = new Map<number, TournamentWithCrew[]>();
    for (const t of data) {
      if (!map.has(t.year)) map.set(t.year, []);
      map.get(t.year)!.push(t);
    }

    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  });

  return (
    <main id="main-content" class="page page--narrow">
      <Title>StarUniv - 대회 히스토리</Title>
      <div class="page-header">
        <h1>대회 히스토리</h1>
        <p>스타크래프트 대학 리그 역대 대회 기록</p>
      </div>

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense
          fallback={
            <div class="loading" role="status" aria-live="polite">
              대회 기록을 불러오는 중…
            </div>
          }
        >
          <Show
            when={groupedByYear().length}
            fallback={<p class="empty-state">대회 기록이 없습니다.</p>}
          >
            <For each={groupedByYear()}>
              {([year, entries]) => (
                <section class={styles.yearSection}>
                  <div class={styles.yearLabel}>{year}</div>
                  <div class={styles.timeline}>
                    <For each={entries}>
                      {(t) => (
                        <div class={styles.entry}>
                          <div class={styles.entryName}>
                            {t.name}
                            <span class={`${styles.statusBadge} ${styles.completed}`}>
                              {t.status}
                            </span>
                          </div>
                          <Show when={t.winner_crew_name}>
                            <div class={styles.entryWinner}>
                              우승:{" "}
                              <A
                                href={`/crews/${encodeURIComponent(t.winner_crew_name!)}`}
                                class={styles.winnerName}
                              >
                                {t.winner_crew_name}
                              </A>
                            </div>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
