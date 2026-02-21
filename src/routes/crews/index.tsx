import { A, createAsync, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, For, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getCrews } from "~/lib/queries";
import styles from "./index.module.css";

export const route = {
  preload: () => getCrews(),
} satisfies RouteDefinition;

export default function CrewsPage() {
  const crews = createAsync(() => getCrews());

  return (
    <main id="main-content" class="page">
      <Title>StarUniv - 크루 목록</Title>
      <div class="page-header">
        <h1>크루 목록</h1>
        <p>활동 중인 크루 현황</p>
      </div>

      <ErrorBoundary fallback={<p class="empty-state">데이터를 불러올 수 없습니다.</p>}>
        <Suspense
          fallback={
            <div class="loading" role="status" aria-live="polite">
              크루 목록을 불러오는 중…
            </div>
          }
        >
          <Show
            when={crews()?.length}
            fallback={<p class="empty-state">등록된 크루가 없습니다.</p>}
          >
            <div class={styles.grid}>
              <For each={crews()}>
                {(crew) => (
                  <A href={`/crews/${crew.name}`} class={styles.card}>
                    <div class={styles.cardName}>{crew.name}</div>
                    <div class={styles.cardCount}>
                      멤버 <span class={styles.cardCountNum}>{crew.member_count}</span>명
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
