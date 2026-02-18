import type { Race } from "~/lib/types";
import styles from "./race-badge.module.css";

const RACE_NAMES: Record<Race, string> = {
  T: "Terran",
  Z: "Zerg",
  P: "Protoss",
};

interface Props {
  race: Race;
}

export default function RaceBadge(props: Props) {
  return (
    <span
      class={`${styles.badge} ${styles[props.race]}`}
      role="img"
      aria-label={RACE_NAMES[props.race]}
      title={RACE_NAMES[props.race]}
    >
      {props.race}
    </span>
  );
}
