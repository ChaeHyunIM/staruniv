import type { Tag } from "~/lib/types";
import styles from "./TagBadge.module.css";

const TAG_LABELS: Record<Tag, string> = {
  승급임박: "승급임박",
  상승: "상승",
  new: "NEW",
  inactive: "비활성",
};

interface Props {
  tag: Tag | null;
}

export default function TagBadge(props: Props) {
  return (
    <span
      class={styles.badge}
      data-tag={props.tag ?? undefined}
      aria-label={props.tag ? TAG_LABELS[props.tag] : undefined}
    >
      {props.tag ? TAG_LABELS[props.tag] : null}
    </span>
  );
}
