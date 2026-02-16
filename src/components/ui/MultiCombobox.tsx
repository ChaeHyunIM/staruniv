import { Combobox } from "@kobalte/core/combobox";
import { For, Show, type JSX } from "solid-js";
import { CheckIcon, ChevronIcon } from "./icons";
import styles from "./select.module.css";

export function MultiCombobox<T>(props: {
  class?: string;
  label: string;
  options: T[];
  optionValue: keyof T & string;
  optionTextValue: keyof T & string;
  optionLabel: keyof T & string;
  defaultFilter?: "startsWith" | "endsWith" | "contains";
  value: T[];
  onChange: (values: T[]) => void;
  itemLabel: (rawValue: T) => JSX.Element;
  chipLabel: (option: T) => string;
  chipAttrs?: (option: T) => Record<string, string | undefined>;
  placeholder?: string;
}) {
  const placeholder = () => props.placeholder ?? "전체";

  return (
    <Combobox<T>
      multiple
      class={props.class ? `${styles.field} ${props.class}` : styles.field}
      options={props.options}
      optionValue={props.optionValue}
      optionTextValue={props.optionTextValue}
      optionLabel={props.optionLabel}
      defaultFilter={props.defaultFilter}
      value={props.value}
      onChange={props.onChange}
      placeholder={placeholder()}
      itemComponent={(itemProps) => (
        <Combobox.Item item={itemProps.item} class={styles.item}>
          <Combobox.ItemLabel>
            {props.itemLabel(itemProps.item.rawValue)}
          </Combobox.ItemLabel>
          <Combobox.ItemIndicator class={styles.itemIndicator}>
            <CheckIcon />
          </Combobox.ItemIndicator>
        </Combobox.Item>
      )}
    >
      <Combobox.Label class={styles.label}>{props.label}</Combobox.Label>
      <Combobox.Control<T> class={styles.trigger}>
        {(state) => (
          <>
            <Show
              when={state.selectedOptions().length > 0}
              fallback={<Combobox.Input class={styles.comboInput} />}
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
                <Combobox.Input class={styles.comboInput} />
              </div>
            </Show>
            <Combobox.Trigger class={styles.comboTrigger}>
              <ChevronIcon />
            </Combobox.Trigger>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class={styles.content}>
          <Combobox.Listbox class={styles.listbox} />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
