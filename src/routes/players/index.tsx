import { A, createAsync, useSearchParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getPlayers } from "~/lib/queries";
import RaceBadge from "~/components/RaceBadge";
import TierBadge from "~/components/TierBadge";
import TagBadge from "~/components/TagBadge";
import PlayerFilters from "~/components/PlayerFilters";
import styles from "./index.module.css";

export const route = {
  preload: () => getPlayers({}),
} satisfies RouteDefinition;

export default function PlayersPage() {
  const [searchParams] = useSearchParams();

  const players = createAsync(() =>
    getPlayers({
      race: searchParams.race || undefined,
      tier: searchParams.tier || undefined,
      crew: searchParams.crew || undefined,
      gender: searchParams.gender || undefined,
      search: searchParams.search || undefined,
    })
  );

  return (
    <main id="main-content" class={styles.page}>
      <Title>StarUniv - 선수 목록</Title>
      <div class={styles.header}>
        <h1>선수 목록</h1>
        <p>전체 선수 목록 및 필터링</p>
      </div>

      <PlayerFilters />

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">선수 목록을 불러오는 중…</div>}>
          <Show when={players()?.length} fallback={<p class="empty-state">조건에 맞는 선수가 없습니다.</p>}>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>종족</th>
                    <th>티어</th>
                    <th>닉네임</th>
                    <th>크루</th>
                    <th>성별</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={players()}>
                    {(p) => (
                      <tr>
                        <td><RaceBadge race={p.race} /></td>
                        <td><TierBadge tier={p.tier} /></td>
                        <td>
                          <A href={`/players/${encodeURIComponent(p.nickname)}`} class={styles.nickname}>
                            {p.nickname}
                          </A>
                        </td>
                        <td>
                          <Show when={p.crew_name} fallback={<span class={styles.faTag}>FA</span>}>
                            <A href={`/crews/${encodeURIComponent(p.crew_name!)}`} class={styles.crewLink}>
                              {p.crew_name}
                            </A>
                          </Show>
                        </td>
                        <td>{p.gender === "M" ? "남" : "여"}</td>
                        <td>
                          <Show when={p.tag}>
                            <TagBadge tag={p.tag} />
                          </Show>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
