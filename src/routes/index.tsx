import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Match, Show, Suspense, Switch, createMemo } from "solid-js";
import { Title } from "@solidjs/meta";
import { getAllPlayers } from "~/lib/queries";
import { MALE_TIERS, FEMALE_TIERS, TIER_DESCRIPTIONS, type Tier } from "~/lib/types";
import type { PlayerWithCrew } from "~/lib/types";
import ViewTabs, { type ViewType } from "~/components/ViewTabs";
import PlayerCard from "~/components/PlayerCard";
import PlayerFilters from "~/components/PlayerFilters";
import styles from "./index.module.css";

export const route = {
  preload: () => getAllPlayers(),
} satisfies RouteDefinition;

const VIEW_TITLES: Record<ViewType, { h1: string; desc: string; title: string }> = {
  tier: { h1: "티어표", desc: "스타크래프트 대학 리그 선수 티어 현황", title: "StarUniv - 티어표" },
  players: { h1: "선수 목록", desc: "전체 선수 목록 및 필터링", title: "StarUniv - 선수 목록" },
  fa: { h1: "FA 명단", desc: "소속 크루가 없는 FA 선수 목록", title: "StarUniv - FA 명단" },
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const currentView = (): ViewType => (searchParams.view as ViewType) ?? "tier";

  /* ── 단일 fetch: 모든 active 선수 ── */
  const allPlayers = createAsync(() => getAllPlayers());

  /* ── 티어 뷰: tier별 그룹화 ── */
  const tierData = createMemo(() => {
    const players = allPlayers();
    if (!players) return {} as Record<string, PlayerWithCrew[]>;

    const tiers: Record<string, PlayerWithCrew[]> = {};
    for (const p of players) {
      if (!p.tier) continue;
      if (!tiers[p.tier]) tiers[p.tier] = [];
      tiers[p.tier].push(p);
    }
    return tiers;
  });

  /* ── 선수 목록 뷰: 필터 적용 ── */
  const playersData = createMemo(() => {
    const players = allPlayers();
    if (!players) return [];

    const race = searchParams.race as string | undefined;
    const tier = searchParams.tier as string | undefined;
    const crew = searchParams.crew as string | undefined;
    const gender = searchParams.gender as string | undefined;
    const search = (searchParams.search as string | undefined)?.toLowerCase();

    return players.filter((p) => {
      if (race && p.race !== race) return false;
      if (tier && p.tier !== tier) return false;
      if (crew && p.crew_name !== crew) return false;
      if (gender && p.gender !== gender) return false;
      if (search && !p.nickname.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  /* ── FA 뷰: is_fa 필터 ── */
  const faPlayers = createMemo(() => {
    const players = allPlayers();
    if (!players) return [];
    return players.filter((p) => p.is_fa);
  });

  const maleFAPlayers = createMemo(() => faPlayers().filter((p) => p.gender === "M"));
  const femaleFAPlayers = createMemo(() => faPlayers().filter((p) => p.gender === "F"));

  /* ── Tier section renderer ── */
  const renderTierSection = (tier: Tier, index: number) => (
    <Show when={tierData()[tier]?.length}>
      <section class={styles.tierSection} style={{ "animation-delay": `${index * 0.05}s` }}>
        <div class={styles.tierHeader}>
          <span class={styles.tierLabel} data-tier={tier}>
            {tier}
          </span>
          <span class={styles.tierCount}>
            {tierData()[tier].length}명
          </span>
          <span class={styles.tierDesc}>
            {TIER_DESCRIPTIONS[tier]}
          </span>
        </div>
        <div class={styles.tierGrid}>
          <For each={tierData()[tier]}>
            {(player) => <PlayerCard player={player} variant="compact" />}
          </For>
        </div>
      </section>
    </Show>
  );

  const viewInfo = () => VIEW_TITLES[currentView()];

  return (
    <main id="main-content" class={styles.home}>
      <Title>{viewInfo().title}</Title>
      <div class={styles.header}>
        <h1>{viewInfo().h1}</h1>
        <p>{viewInfo().desc}</p>
      </div>

      <ViewTabs />

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">데이터를 불러오는 중…</div>}>
          <Switch>
            {/* ── Tier View ── */}
            <Match when={currentView() === "tier"}>
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
            </Match>

            {/* ── Players View ── */}
            <Match when={currentView() === "players"}>
              <PlayerFilters />
              <Show
                when={playersData().length}
                fallback={<p class="empty-state">조건에 맞는 선수가 없습니다.</p>}
              >
                <div class={styles.playersGrid}>
                  <For each={playersData()}>
                    {(player) => <PlayerCard player={player} variant="full" />}
                  </For>
                </div>
              </Show>
            </Match>

            {/* ── FA View ── */}
            <Match when={currentView() === "fa"}>
              <Show
                when={faPlayers().length}
                fallback={<p class="empty-state">FA 선수가 없습니다.</p>}
              >
                <Show when={maleFAPlayers().length}>
                  <section class={styles.faSection}>
                    <h2>
                      남자 선수 <span class={styles.faCount}>{maleFAPlayers().length}명</span>
                    </h2>
                    <div class={styles.playersGrid}>
                      <For each={maleFAPlayers()}>
                        {(p) => <PlayerCard player={p} variant="full" />}
                      </For>
                    </div>
                  </section>
                </Show>
                <Show when={femaleFAPlayers().length}>
                  <section class={styles.faSection}>
                    <h2>
                      여자 선수 <span class={styles.faCount}>{femaleFAPlayers().length}명</span>
                    </h2>
                    <div class={styles.playersGrid}>
                      <For each={femaleFAPlayers()}>
                        {(p) => <PlayerCard player={p} variant="full" />}
                      </For>
                    </div>
                  </section>
                </Show>
              </Show>
            </Match>
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
