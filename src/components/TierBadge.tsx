import type { Tier } from "~/lib/types";
import styles from "./TierBadge.module.css";

interface Props {
  tier: Tier | null;
}

export default function TierBadge(props: Props) {
  const tier = () => props.tier ?? "-";
  const cls = () => (props.tier ? styles[props.tier] : "");

  return (
    <span class={`${styles.badge} ${cls()}`}>
      {tier()}
    </span>
  );
}
