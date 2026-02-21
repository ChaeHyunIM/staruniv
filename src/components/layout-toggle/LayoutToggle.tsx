import LayoutGrid from "lucide-solid/icons/layout-grid";
import LayoutList from "lucide-solid/icons/layout-list";
import { For } from "solid-js";
import styles from "./layout-toggle.module.css";

export type CardVariant = "compact" | "full" | "list";

const VARIANTS: { id: CardVariant; icon: typeof LayoutGrid; label: string }[] = [
  { id: "compact", icon: LayoutList, label: "컴팩트" },
  { id: "full", icon: LayoutGrid, label: "카드" },
  // { id: "list", icon: List, label: "리스트" },
];

interface Props {
  value: CardVariant;
  onChange: (variant: CardVariant) => void;
}

export default function LayoutToggle(props: Props) {
  const activeIndex = () => VARIANTS.findIndex((v) => v.id === props.value);

  return (
    <div
      class={styles.toggle}
      role="group"
      aria-label="카드 표시 방식"
      style={{ "--active-index": String(activeIndex()) }}
    >
      <For each={VARIANTS}>
        {(v) => (
          <button
            class={styles.btn}
            classList={{ [styles.active]: props.value === v.id }}
            aria-pressed={props.value === v.id}
            aria-label={v.label}
            title={v.label}
            onClick={() => props.onChange(v.id)}
          >
            <v.icon size={16} />
          </button>
        )}
      </For>
    </div>
  );
}
