import { A, createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getCrew } from "~/lib/queries";
import RaceBadge from "~/components/RaceBadge";
import TierBadge from "~/components/TierBadge";
import styles from "./[name].module.css";

export const route = {
  preload: ({ params }) => getCrew(params.name),
} satisfies RouteDefinition;

export default function CrewDetailPage() {
  const params = useParams();
  const crew = createAsync(() => getCrew(params.name));

  return (
    <main class={styles.page}>
      <Suspense fallback={<div class="loading">크루 정보를 불러오는 중</div>}>
        <ErrorBoundary fallback={<p class="empty-state">크루를 찾을 수 없습니다.</p>}>
          <Show when={crew()} fallback={<p class="empty-state">크루를 찾을 수 없습니다.</p>}>
            {(c) => (
              <>
                <Title>StarUniv - {c().name}</Title>
                <A href="/crews" class={styles.back}>
                  &larr; 크루 목록
                </A>
                <div class={styles.crewHeader}>
                  <h1>{c().name}</h1>
                  <span class={styles.memberCount}>{c().member_count}명</span>
                </div>
                <section class={styles.section}>
                  <h2>로스터</h2>
                  <Show
                    when={c().players.length}
                    fallback={<p class="empty-state">소속 선수가 없습니다.</p>}
                  >
                    <div class="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>종족</th>
                            <th>티어</th>
                            <th>닉네임</th>
                            <th>성별</th>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={c().players}>
                            {(p) => (
                              <tr>
                                <td><RaceBadge race={p.race} /></td>
                                <td><TierBadge tier={p.tier} /></td>
                                <td>
                                  <A href={`/players/${encodeURIComponent(p.nickname)}`} class={styles.nickname}>
                                    {p.nickname}
                                  </A>
                                </td>
                                <td>{p.gender === "M" ? "남" : "여"}</td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </Show>
                </section>
              </>
            )}
          </Show>
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}
