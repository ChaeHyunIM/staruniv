import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense, createMemo } from "solid-js";
import { Title } from "@solidjs/meta";
import { getFAPlayers } from "~/lib/queries";
import RaceBadge from "~/components/RaceBadge";
import TierBadge from "~/components/TierBadge";
import styles from "./fa.module.css";

export const route = {
  preload: () => getFAPlayers(),
} satisfies RouteDefinition;

export default function FAPage() {
  const players = createAsync(() => getFAPlayers());

  const malePlayers = createMemo(() => players()?.filter((p) => p.gender === "M") ?? []);
  const femalePlayers = createMemo(() => players()?.filter((p) => p.gender === "F") ?? []);

  return (
    <main id="main-content" class={styles.page}>
      <Title>StarUniv - FA 선수</Title>
      <div class={styles.header}>
        <h1>FA 명단</h1>
        <p>소속 크루가 없는 FA 선수 목록</p>
      </div>

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense fallback={<div class="loading" role="status" aria-live="polite">FA 명단을 불러오는 중…</div>}>
          <Show when={players()?.length} fallback={<p class="empty-state">FA 선수가 없습니다.</p>}>
            <Show when={malePlayers().length}>
              <section class={styles.section}>
                <h2>
                  남자 선수 <span class={styles.sectionCount}>{malePlayers().length}명</span>
                </h2>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>종족</th>
                        <th>티어</th>
                        <th>닉네임</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={malePlayers()}>
                        {(p) => (
                          <tr>
                            <td><RaceBadge race={p.race} /></td>
                            <td><TierBadge tier={p.tier} /></td>
                            <td>
                              <A href={`/players/${encodeURIComponent(p.nickname)}`} class={styles.nickname}>
                                {p.nickname}
                              </A>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </section>
            </Show>

            <Show when={femalePlayers().length}>
              <section class={styles.section}>
                <h2>
                  여자 선수 <span class={styles.sectionCount}>{femalePlayers().length}명</span>
                </h2>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>종족</th>
                        <th>티어</th>
                        <th>닉네임</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={femalePlayers()}>
                        {(p) => (
                          <tr>
                            <td><RaceBadge race={p.race} /></td>
                            <td><TierBadge tier={p.tier} /></td>
                            <td>
                              <A href={`/players/${encodeURIComponent(p.nickname)}`} class={styles.nickname}>
                                {p.nickname}
                              </A>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </section>
            </Show>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
