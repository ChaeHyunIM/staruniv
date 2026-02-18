import { A, createAsync, useParams, type RouteDefinition } from "@solidjs/router";
import { ErrorBoundary, Show, Suspense } from "solid-js";
import { Title } from "@solidjs/meta";
import { getPlayer } from "~/lib/queries";
import RaceBadge from "~/components/race-badge";
import TierBadge from "~/components/tier-badge";
import TagBadge from "~/components/tag-badge";
import styles from "./[nickname].module.css";

export const route = {
  preload: ({ params }) => getPlayer(params.nickname!),
} satisfies RouteDefinition;

export default function PlayerDetailPage() {
  const params = useParams<{ nickname: string }>();
  const player = createAsync(() => getPlayer(params.nickname));

  return (
    <main id="main-content" class="page page--detail">
      <Suspense
        fallback={
          <div class="loading" role="status" aria-live="polite">
            선수 정보를 불러오는 중…
          </div>
        }
      >
        <ErrorBoundary fallback={<p class="empty-state">선수를 찾을 수 없습니다.</p>}>
          <Show when={player()} fallback={<p class="empty-state">선수를 찾을 수 없습니다.</p>}>
            {(p) => (
              <>
                <Title>StarUniv - {p().nickname}</Title>
                <A href="/?view=players" class="back-link">
                  &larr; 선수 목록
                </A>
                <div class={styles.card}>
                  <div class={styles.nameRow}>
                    <RaceBadge race={p().race} />
                    <TierBadge tier={p().tier} />
                    <h1>{p().nickname}</h1>
                    <Show when={p().tag}>
                      <TagBadge tag={p().tag} />
                    </Show>
                  </div>
                  <dl class={styles.info}>
                    <div class={styles.field}>
                      <dt>종족</dt>
                      <dd>{p().race === "T" ? "Terran" : p().race === "Z" ? "Zerg" : "Protoss"}</dd>
                    </div>
                    <div class={styles.field}>
                      <dt>티어</dt>
                      <dd>{p().tier ?? "-"}</dd>
                    </div>
                    <div class={styles.field}>
                      <dt>성별</dt>
                      <dd>{p().gender === "M" ? "남" : "여"}</dd>
                    </div>
                    <div class={styles.field}>
                      <dt>크루</dt>
                      <dd>
                        <Show when={p().crew_name} fallback="FA">
                          <A
                            href={`/crews/${encodeURIComponent(p().crew_name!)}`}
                            class={styles.crewLink}
                          >
                            {p().crew_name}
                          </A>
                        </Show>
                      </dd>
                    </div>
                    <div class={styles.field}>
                      <dt>상태</dt>
                      <dd>{p().is_fa ? "FA" : "소속"}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
          </Show>
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}
