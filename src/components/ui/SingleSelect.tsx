import { Select } from "@kobalte/core/select";
import { Show, type JSX } from "solid-js";
import { CheckIcon, ChevronIcon } from "./icons";
import styles from "./select.module.css";

export function SingleSelect<T>(props: {
  class?: string;
  label: string;
  options: T[];
  optionValue: (opt: T) => string;
  optionTextValue: (opt: T) => string;
  value: T | null;
  onChange: (value: T | null) => void;
  itemLabel: (rawValue: T) => JSX.Element;
  selectedLabel: (option: T) => string;
  placeholder?: string;
}) {
  const placeholder = () => props.placeholder ?? "전체";

  return (
    <Select<T>
      class={props.class ? `${styles.field} ${props.class}` : styles.field}
      options={props.options}
      optionValue={props.optionValue}
      optionTextValue={props.optionTextValue}
      value={props.value ?? undefined}
      onChange={props.onChange}
      placeholder={placeholder()}
      itemComponent={(itemProps) => (
        <Select.Item item={itemProps.item} class={styles.item}>
          <Select.ItemLabel>
            {props.itemLabel(itemProps.item.rawValue)}
          </Select.ItemLabel>
          <Select.ItemIndicator class={styles.itemIndicator}>
            <CheckIcon />
          </Select.ItemIndicator>
        </Select.Item>
      )}
    >
      <Select.Label class={styles.label}>{props.label}</Select.Label>
      <Select.Trigger class={styles.trigger}>
        <Select.Value<T>>
          {(state) => (
            <Show
              when={state.selectedOption()}
              fallback={<span class={styles.placeholder}>{placeholder()}</span>}
            >
              {props.selectedLabel(state.selectedOption()!)}
            </Show>
          )}
        </Select.Value>
        <Select.Icon class={styles.icon}>
          <ChevronIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class={styles.content}>
          <Select.Listbox class={styles.listbox} />
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}
