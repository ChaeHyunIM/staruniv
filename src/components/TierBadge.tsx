import type { Tier } from "~/lib/types";
import styles from "./TierBadge.module.css";

const TIER_LABELS: Record<string, string> = {
  S: "S 티어",
  A: "A 티어",
  B: "B 티어",
  C: "C 티어",
};

interface Props {
  tier: Tier | null;
}

export default function TierBadge(props: Props) {
  const tier = () => props.tier ?? "-";
  const cls = () => (props.tier ? styles[props.tier] : "");
  const label = () => (props.tier ? TIER_LABELS[props.tier] : "티어 미정");

  return (
    <span
      class={`${styles.badge} ${cls()}`}
      role="img"
      aria-label={label()}
      title={label()}
    >
      {tier()}
    </span>
  );
}
