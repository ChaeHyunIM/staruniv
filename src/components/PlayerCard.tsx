import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import type { PlayerWithCrew } from "~/lib/types";
import { getInitials } from "~/lib/utils";
import RaceBadge from "./RaceBadge";
import TierBadge from "./TierBadge";
import TagBadge from "./TagBadge";
import styles from "./PlayerCard.module.css";

interface Props {
  player: PlayerWithCrew;
  variant: "compact" | "full";
}

export default function PlayerCard(props: Props) {
  const initials = () => getInitials(props.player.nickname);
  const [flipUp, setFlipUp] = createSignal(false);

  const handleMouseEnter = (e: MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const grid = el.parentElement;
    if (!grid) return;
    const elRect = el.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const expandedHeight = elRect.width + 100;
    setFlipUp(gridRect.bottom - elRect.top < expandedHeight);
  };

  return (
    <A
      href={`/players/${encodeURIComponent(props.player.nickname)}`}
      class={props.variant === "compact" ? styles.compact : styles.full}
      classList={{ [styles.flipUp]: flipUp() }}
      data-race={props.player.race}
      onMouseEnter={props.variant === "compact" ? handleMouseEnter : undefined}
    >
      {/* Accent strip — compact only */}
      <Show when={props.variant === "compact"}>
        <div class={styles.accent} aria-hidden="true" />
      </Show>

      {/* Avatar */}
      <div class={styles.avatar} data-race={props.player.race}>
        <Show
          when={props.player.profile_image}
          fallback={<span class={styles.initials}>{initials()}</span>}
        >
          <img
            src={`https:${props.player.profile_image}`}
            alt=""
            class={styles.avatarPhoto}
            loading="lazy"
          />
        </Show>
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

      {/* Expanded vertical card overlay — compact only */}
      <Show when={props.variant === "compact"}>
        <div class={styles.expanded} aria-hidden="true">
          <div class={styles.expandedHero} data-race={props.player.race}>
            <Show when={props.player.profile_image}>
              <img
                src={`https:${props.player.profile_image}`}
                alt=""
                class={styles.expandedPhoto}
                loading="lazy"
              />
            </Show>
          </div>
          <div class={styles.expandedBody}>
            <div class={styles.expandedName}>
              <span class={styles.expandedRace} data-race={props.player.race}>
                {props.player.race}
              </span>
              <span>{props.player.nickname}</span>
              <Show when={props.player.tag}>
                <TagBadge tag={props.player.tag} />
              </Show>
            </div>
            <div class={styles.expandedFooter}>
              <Show when={props.player.crew_name}>
                <span class={styles.expandedCrew}>{props.player.crew_name}</span>
              </Show>
              <Show when={!props.player.crew_name && props.player.is_fa}>
                <span class={styles.expandedFa}>FA</span>
              </Show>
            </div>
            <span class={styles.expandedLink}>프로필 보기 →</span>
          </div>
        </div>
      </Show>
    </A>
  );
}
