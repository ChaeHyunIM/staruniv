import { A } from "@solidjs/router";
import { Show } from "solid-js";
import type { PlayerWithCrew } from "~/lib/types";
import { getInitials } from "~/lib/utils";
import RaceBadge from "./RaceBadge";
import TagBadge from "./TagBadge";
import styles from "./PlayerCard.module.css";

interface Props {
  player: PlayerWithCrew;
  variant: "compact" | "full";
}

/** 원본 프로필 이미지 경로를 webp(420x420, ~11-20KB)로 변환 */
function profileWebp(path: string) {
  return path.replace(/\.jpg$/, ".webp");
}

export default function PlayerCard(props: Props) {
  const initials = () => getInitials(props.player.nickname);

  return (
    <A
      href={`/players/${encodeURIComponent(props.player.nickname)}`}
      class={props.variant === "compact" ? styles.compact : styles.full}
      data-race={props.player.race}
    >
      {/* Accent strip — compact only */}
      <Show when={props.variant === "compact"}>
        <div class={styles.accent} aria-hidden="true" />
      </Show>

      {/* Avatar — webp 사용 (420x420, ~11-20KB) */}
      <div class={styles.avatar} data-race={props.player.race}>
        <Show
          when={props.player.profile_image}
          fallback={<span class={styles.initials}>{initials()}</span>}
        >
          <img
            src={`https:${profileWebp(props.player.profile_image!)}`}
            alt=""
            class={styles.avatarPhoto}
            loading="lazy"
            decoding="async"
          />
        </Show>
      </div>

      {/* Body */}
      <div class={styles.body}>
        <div class={styles.nameRow}>
          <span class={styles.name}>{props.player.nickname}</span>
          <Show when={props.player.crew_name}>
            <span class={styles.crew}>{props.player.crew_name}</span>
          </Show>
          <Show when={!props.player.crew_name && props.player.is_fa}>
            <span class={styles.crew}>FA</span>
          </Show>
        </div>
        <div class={styles.meta}>
          <RaceBadge race={props.player.race} />
          <Show when={props.player.tag}>
            <TagBadge tag={props.player.tag} />
          </Show>
        </div>
      </div>
    </A>
  );
}
