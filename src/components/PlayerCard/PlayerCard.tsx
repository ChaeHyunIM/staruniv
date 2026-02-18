import { A } from "@solidjs/router";
import type { PlayerWithCrew } from "~/lib/types";
import { getInitials } from "~/lib/utils";
import RaceBadge from "../RaceBadge";
import TagBadge from "../TagBadge";
import styles from "./PlayerCard.module.css";

interface Props {
  player: PlayerWithCrew;
  variant: "compact" | "full" | "list";
}

/** 원본 프로필 이미지 경로를 webp(420x420, ~11-20KB)로 변환 */
function profileWebp(path: string) {
  return path.replace(/\.jpg$/, ".webp");
}

/**
 * hydration mismatch 방지를 위해 <Show> 대신 CSS + classList로 가시성 제어.
 * DOM 구조가 항상 동일하므로 <A>의 spread hydration이 안전함.
 */
export default function PlayerCard(props: Props) {
  const initials = () => getInitials(props.player.nickname);

  return (
    <A
      href={`/players/${encodeURIComponent(props.player.nickname)}`}
      class={styles[props.variant]}
      data-race={props.player.race}
    >
      <div class={styles.avatar} data-race={props.player.race}>
        <img
          ref={(el) => {
            /* 하이드레이션 전에 이미 로드된 이미지 처리 */
            if (el.complete && el.naturalWidth > 0)
              el.classList.add(styles.loaded);
          }}
          src={
            props.player.profile_image
              ? `https:${profileWebp(props.player.profile_image)}`
              : undefined
          }
          alt={props.player.nickname}
          width={80}
          height={80}
          class={styles.avatarPhoto}
          onLoad={(e) => e.currentTarget.classList.add(styles.loaded)}
          onError={(e) => e.currentTarget.classList.add(styles.loaded)}
        />
        <span class={styles.initials}>{initials()}</span>
      </div>

      <div class={styles.body}>
        <div class={styles.nameRow}>
          <span class={styles.name}>{props.player.nickname}</span>
          <span
            class={styles.crew}
            classList={{
              [styles.hidden]: !props.player.crew_name && !props.player.is_fa,
            }}
          >
            {props.player.crew_name || (props.player.is_fa ? "FA" : "")}
          </span>
        </div>
        <div class={styles.meta}>
          <RaceBadge race={props.player.race} />
          <TagBadge tag={props.player.tag} />
        </div>
      </div>
    </A>
  );
}
