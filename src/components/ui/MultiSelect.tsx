import { Select } from "@kobalte/core/select";
import { For, Show, type JSX } from "solid-js";
import { CheckIcon, ChevronIcon } from "./icons";
import styles from "./select.module.css";

export function MultiSelect<T>(props: {
  class?: string;
  label: string;
  options: T[];
  optionValue: (opt: T) => string;
  optionTextValue: (opt: T) => string;
  value: T[];
  onChange: (values: T[]) => void;
  itemLabel: (rawValue: T) => JSX.Element;
  chipLabel: (option: T) => string;
  chipAttrs?: (option: T) => Record<string, string | undefined>;
  placeholder?: string;
}) {
  const placeholder = () => props.placeholder ?? "전체";

  return (
    <Select<T>
      multiple
      class={props.class ? `${styles.field} ${props.class}` : styles.field}
      options={props.options}
      optionValue={props.optionValue}
      optionTextValue={props.optionTextValue}
      value={props.value}
      onChange={props.onChange}
      placeholder={placeholder()}
      itemComponent={(itemProps) => (
        <Select.Item item={itemProps.item} class={styles.item}>
          <Select.ItemLabel class={styles.itemLabel}>
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
              when={state.selectedOptions().length > 0}
              fallback={<span class={styles.placeholder}>{placeholder()}</span>}
            >
              <div class={styles.chips}>
                <For each={state.selectedOptions()}>
                  {(option) => (
                    <span
                      class={styles.chip}
                      {...(props.chipAttrs?.(option) ?? {})}
                    >
                      {props.chipLabel(option)}
                      <button
                        class={styles.chipRemove}
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          state.remove(option);
                        }}
                        aria-label={`${props.chipLabel(option)} 제거`}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </For>
              </div>
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
