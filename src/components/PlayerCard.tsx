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

      {/* Avatar */}
      <div class={styles.avatar} data-race={props.player.race}>
        <span class={styles.initials}>{initials()}</span>
      </div>

      {/* Body */}
      <div class={styles.body}>
        <div class={styles.nameRow}>
          <span class={styles.name}>{props.player.nickname}</span>
          <Show when={props.player.tag}>
            <TagBadge tag={props.player.tag} />
          </Show>
        </div>
        <div class={styles.meta}>
          <RaceBadge race={props.player.race} />
          <Show when={props.player.crew_name}>
            <span class={styles.crew}>{props.player.crew_name}</span>
          </Show>
          <Show when={!props.player.crew_name && props.player.is_fa}>
            <span class={styles.faLabel}>FA</span>
          </Show>
        </div>
      </div>
    </A>
  );
}
