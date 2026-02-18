import type { Tier } from "~/lib/types";
import styles from "./TierBadge.module.css";

const TIER_LABELS: Record<string, string> = {
  God: "God 티어",
  King: "King 티어",
  Jack: "Jack 티어",
  Joker: "Joker 티어",
  Spade: "Spade 티어",
  "0": "0 티어",
  "1": "1 티어",
  "2": "2 티어",
  "3": "3 티어",
  "4": "4 티어",
  "5": "5 티어",
  "6": "6 티어",
  "7": "7 티어",
  "8": "8 티어",
  Baby: "Baby 티어",
};

interface Props {
  tier: Tier | null;
}

export default function TierBadge(props: Props) {
  const tier = () => props.tier ?? "-";
  const label = () => (props.tier ? TIER_LABELS[props.tier] : "티어 미정");

  return (
    <span
      class={styles.badge}
      data-tier={props.tier ?? undefined}
      role="img"
      aria-label={label()}
      title={label()}
    >
      {tier()}
    </span>
  );
}
