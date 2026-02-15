import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getPlayersByTier } from "~/lib/queries";
import { MALE_TIERS, FEMALE_TIERS, TIER_DESCRIPTIONS, type Tier } from "~/lib/types";
import RaceBadge from "~/components/RaceBadge";
import TagBadge from "~/components/TagBadge";
import styles from "./index.module.css";

export const route = {
  preload: () => getPlayersByTier(),
} satisfies RouteDefinition;

export default function Home() {
  const tierData = createAsync(() => getPlayersByTier());

  const renderTierSection = (tier: Tier, index: number) => (
    <Show when={tierData()?.[tier]?.length}>
      <section class={styles.tierSection} style={{ "animation-delay": `${index * 0.05}s` }}>
        <div class={styles.tierHeader}>
          <span class={styles.tierLabel} data-tier={tier}>
            {tier}
          </span>
          <span class={styles.tierCount}>
            {tierData()![tier].length}명
          </span>
          <span class={styles.tierDesc}>
            {TIER_DESCRIPTIONS[tier]}
          </span>
        </div>
        <div class={styles.grid}>
          <For each={tierData()![tier]}>
            {(player) => (
              <A href={`/players/${encodeURIComponent(player.nickname)}`} class={styles.playerCard} data-race={player.race}>
                <RaceBadge race={player.race} />
                <div class={styles.playerInfo}>
                  <div class={styles.playerName}>
                    {player.nickname}
                    <Show when={player.tag}>
                      <TagBadge tag={player.tag} />
                    </Show>
                  </div>
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
  );

  return (
    <main id="main-content" class={styles.home}>
      <Title>StarUniv - 티어표</Title>
      <div class={styles.header}>
        <h1>티어표</h1>
        <p>스타크래프트 대학 리그 선수 티어 현황</p>
      </div>

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">티어표를 불러오는 중…</div>}>
          <div class={styles.genderSection}>
            <h2>남자 티어</h2>
            <For each={MALE_TIERS}>
              {(tier, i) => renderTierSection(tier, i())}
            </For>
          </div>

          <div class={styles.genderSection}>
            <h2>여자 티어</h2>
            <For each={FEMALE_TIERS}>
              {(tier, i) => renderTierSection(tier, i() + MALE_TIERS.length)}
            </For>
          </div>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
