import { createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createMemo, createSignal, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import { getAllPlayers, getCrews } from "~/lib/queries";
import { TIER_ORDER, TIER_DESCRIPTIONS, type Tier } from "~/lib/types";
import type { PlayerWithCrew } from "~/lib/types";
import PlayerCard from "~/components/PlayerCard";
import { clientOnly } from "@solidjs/start";
const PlayerFilters = clientOnly(() => import("~/components/PlayerFilters"));
import LayoutToggle, { type CardVariant } from "~/components/LayoutToggle";
import TierNavigator from "~/components/TierNavigator";
import styles from "./index.module.css";

export const route = {
  preload: () => { getAllPlayers(); getCrews(); },
} satisfies RouteDefinition;

export default function Home() {
  const [searchParams] = useSearchParams();

  /* ── 카드 variant 상태 (localStorage 연동) ── */
  const [cardVariant, setCardVariant] = createSignal<CardVariant>("compact");

  /* ── 티어 순서 상태 (localStorage 연동) ── */
  const [orderedTiers, setOrderedTiers] = createSignal<Tier[]>([...TIER_ORDER]);

  onMount(() => {
    try {
      const savedVariant = localStorage.getItem("cardVariant");
      if (savedVariant && ["compact", "full", "list"].includes(savedVariant)) {
        setCardVariant(savedVariant as CardVariant);
      }
    } catch { /* ignore */ }

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
    } catch { /* ignore */ }
  });

  const handleVariantChange = (v: CardVariant) => {
    setCardVariant(v);
    localStorage.setItem("cardVariant", v);
  };

  const handleReorder = (tiers: Tier[]) => {
    setOrderedTiers(tiers);
    localStorage.setItem("tierOrder", JSON.stringify(tiers));
  };

  /* ── 단일 fetch: 모든 active 선수 ── */
  const allPlayers = createAsync(() => getAllPlayers());

  /* ── 티어별 그룹화 + 필터 적용 ── */
  const tierData = createMemo(() => {
    const players = allPlayers();
    if (!players) return {} as Record<string, PlayerWithCrew[]>;

    const races = searchParams.race ? (searchParams.race as string).split(",") : [];
    const tierFilter = searchParams.tier ? (searchParams.tier as string).split(",") : [];
    const crewParam = searchParams.crew ? (searchParams.crew as string).split(",") : [];
    const hasFa = crewParam.includes("FA");
    const crewNames = crewParam.filter((n) => n !== "FA");
    const gender = searchParams.gender as string | undefined;
    const search = (searchParams.search as string | undefined)?.toLowerCase();

    const tiers: Record<string, PlayerWithCrew[]> = {};
    for (const p of players) {
      if (!p.tier) continue;

      /* 필터 적용 */
      if (races.length && !races.includes(p.race)) continue;
      if (tierFilter.length && !tierFilter.includes(p.tier)) continue;
      if (hasFa || crewNames.length) {
        const matchesFa = hasFa && p.is_fa;
        const matchesCrew = crewNames.length > 0 && !!p.crew_name && crewNames.includes(p.crew_name);
        if (!matchesFa && !matchesCrew) continue;
      }
      if (gender && p.gender !== gender) continue;
      if (search && !p.nickname.toLowerCase().includes(search)) continue;

      if (!tiers[p.tier]) tiers[p.tier] = [];
      tiers[p.tier].push(p);
    }
    return tiers;
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
        <div class={styles.tierGrid} data-variant={cardVariant()}>
          <For each={tierData()[tier]}>
            {(player) => <PlayerCard player={player} variant={cardVariant()} />}
          </For>
        </div>
      </section>
    </Show>
  );

  return (
    <main id="main-content" class={styles.home}>
      <Title>StarUniv - 티어표</Title>
      <div class={styles.header}>
        <div class={styles.headerRow}>
          <h1>티어표</h1>
          <LayoutToggle value={cardVariant()} onChange={handleVariantChange} />
        </div>
        <p>스타크래프트 대학 리그 선수 티어 현황</p>
      </div>

      <PlayerFilters />

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">데이터를 불러오는 중…</div>}>
          <For each={orderedTiers()}>
            {(tier, i) => renderTierSection(tier, i())}
          </For>
          <TierNavigator
            tiers={orderedTiers}
            onReorder={handleReorder}
            tierData={tierData}
          />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
