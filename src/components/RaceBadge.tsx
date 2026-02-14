import type { Race } from "~/lib/types";
import styles from "./RaceBadge.module.css";

interface Props {
  race: Race;
}

export default function RaceBadge(props: Props) {
  return (
    <span
      class={`${styles.badge} ${styles[props.race]}`}
      title={props.race === "T" ? "Terran" : props.race === "Z" ? "Zerg" : "Protoss"}
    >
      {props.race}
    </span>
  );
}
