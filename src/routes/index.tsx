import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Match, Show, Suspense, Switch, createMemo, createSignal, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import { getAllPlayers, getCrews } from "~/lib/queries";
import { TIER_ORDER, TIER_DESCRIPTIONS, type Tier } from "~/lib/types";
import type { PlayerWithCrew } from "~/lib/types";
import ViewTabs, { type ViewType } from "~/components/ViewTabs";
import PlayerCard from "~/components/PlayerCard";
import { clientOnly } from "@solidjs/start";
const PlayerFilters = clientOnly(() => import("~/components/PlayerFilters"));
import TierNavigator from "~/components/TierNavigator";
import styles from "./index.module.css";

export const route = {
  preload: () => { getAllPlayers(); getCrews(); },
} satisfies RouteDefinition;

const VIEW_TITLES: Record<ViewType, { h1: string; desc: string; title: string }> = {
  tier: { h1: "티어표", desc: "스타크래프트 대학 리그 선수 티어 현황", title: "StarUniv - 티어표" },
  players: { h1: "선수 목록", desc: "전체 선수 목록 및 필터링", title: "StarUniv - 선수 목록" },
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const currentView = (): ViewType => (searchParams.view as ViewType) ?? "tier";

  /* ── 티어 순서 상태 (localStorage 연동) ── */
  const [orderedTiers, setOrderedTiers] = createSignal<Tier[]>([...TIER_ORDER]);

  onMount(() => {
    try {
      const saved = localStorage.getItem("tierOrder");
      if (!saved) return;
      const parsed = JSON.parse(saved) as string[];
      if (
        Array.isArray(parsed) &&
        parsed.length === TIER_ORDER.length &&
        TIER_ORDER.every((t) => parsed.includes(t))
      ) {
        setOrderedTiers(parsed as Tier[]);
      }
    } catch {
      /* invalid data → keep defaults */
    }
  });

  const handleReorder = (tiers: Tier[]) => {
    setOrderedTiers(tiers);
    localStorage.setItem("tierOrder", JSON.stringify(tiers));
  };

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

    const races = searchParams.race ? (searchParams.race as string).split(",") : [];
    const tiers = searchParams.tier ? (searchParams.tier as string).split(",") : [];
    const crewParam = searchParams.crew ? (searchParams.crew as string).split(",") : [];
    const hasFa = crewParam.includes("FA");
    const crewNames = crewParam.filter((n) => n !== "FA");
    const gender = searchParams.gender as string | undefined;
    const search = (searchParams.search as string | undefined)?.toLowerCase();

    return players.filter((p) => {
      if (races.length && !races.includes(p.race)) return false;
      if (tiers.length && p.tier && !tiers.includes(p.tier)) return false;
      if (tiers.length && !p.tier) return false;
      /* FA와 크루는 OR 조건: FA 선수이거나 해당 크루 소속이면 통과 */
      if (hasFa || crewNames.length) {
        const matchesFa = hasFa && p.is_fa;
        const matchesCrew = crewNames.length > 0 && !!p.crew_name && crewNames.includes(p.crew_name);
        if (!matchesFa && !matchesCrew) return false;
      }
      if (gender && p.gender !== gender) return false;
      if (search && !p.nickname.toLowerCase().includes(search)) return false;
      return true;
    });
  });

  /* ── Tier section renderer ── */
  const renderTierSection = (tier: Tier, index: number) => (
    <Show when={tierData()[tier]?.length}>
      <section id={`tier-${tier}`} class={styles.tierSection} style={{ "animation-delay": `${index * 0.05}s` }}>
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
              <For each={orderedTiers()}>
                {(tier, i) => renderTierSection(tier, i())}
              </For>
              <TierNavigator
                tiers={orderedTiers}
                onReorder={handleReorder}
                tierData={tierData}
              />
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

          </Switch>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
