import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getPlayersByTier } from "~/lib/queries";
import RaceBadge from "~/components/RaceBadge";
import styles from "./index.module.css";

export const route = {
  preload: () => getPlayersByTier(),
} satisfies RouteDefinition;

const TIER_ORDER = ["S", "A", "B", "C"] as const;
const TIER_NAMES: Record<string, string> = {
  S: "S Tier",
  A: "A Tier",
  B: "B Tier",
  C: "C Tier",
};

export default function Home() {
  const tierData = createAsync(() => getPlayersByTier());

  return (
    <main id="main-content" class={styles.home}>
      <Title>StarUniv - 티어표</Title>
      <div class={styles.header}>
        <h1>티어표</h1>
        <p>스타크래프트 대학 리그 선수 티어 현황</p>
      </div>

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">티어표를 불러오는 중…</div>}>
          <For each={TIER_ORDER}>
            {(tier) => (
              <Show when={tierData()?.[tier]?.length}>
                <section class={styles.tierSection}>
                  <div class={styles.tierHeader}>
                    <span class={styles.tierLabel} data-tier={tier}>
                      {TIER_NAMES[tier]}
                    </span>
                    <span class={styles.tierCount}>
                      {tierData()![tier].length}명
                    </span>
                  </div>
                  <div class={styles.grid}>
                    <For each={tierData()![tier]}>
                      {(player) => (
                        <A href={`/players/${encodeURIComponent(player.nickname)}`} class={styles.playerCard} data-race={player.race}>
                          <RaceBadge race={player.race} />
                          <div class={styles.playerInfo}>
                            <div class={styles.playerName}>{player.nickname}</div>
                            <Show when={player.crew_name}>
                              <div class={styles.playerCrew}>{player.crew_name}</div>
                            </Show>
                          </div>
                        </A>
                      )}
                    </For>
                  </div>
                </section>
              </Show>
            )}
          </For>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
