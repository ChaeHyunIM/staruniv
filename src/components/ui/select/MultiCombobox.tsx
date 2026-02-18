import { Combobox } from "@kobalte/core/combobox";
import { createSignal, For, type JSX } from "solid-js";
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
  const [currentInput, setCurrentInput] = createSignal("");
  let inputRef!: HTMLInputElement;
  let pendingEnterSelect = false;

  /* 필터 로직과 일치하는 첫 번째 미선택 옵션 반환 */
  const findFirstMatch = (): T | undefined => {
    const query = currentInput().trim().toLowerCase();
    if (!query) return undefined;

    return props.options.find((opt) => {
      const text = String(opt[props.optionTextValue]).toLowerCase();
      const isSelected = props.value.some(
        (v) => String(v[props.optionValue]) === String(opt[props.optionValue]),
      );
      if (isSelected) return false;

      switch (props.defaultFilter) {
        case "startsWith":
          return text.startsWith(query);
        case "endsWith":
          return text.endsWith(query);
        default:
          return text.includes(query);
      }
    });
  };

  /* 첫 번째 매칭 옵션 선택 및 입력 초기화 */
  const selectFirstMatch = () => {
    const match = findFirstMatch();
    if (!match) return;
    props.onChange([...props.value, match]);
    /* Kobalte input은 uncontrolled이므로 DOM 직접 초기화 */
    inputRef.value = "";
    inputRef.dispatchEvent(new Event("input", { bubbles: true }));
  };

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
      onInputChange={setCurrentInput}
      itemComponent={(itemProps) => (
        <Combobox.Item item={itemProps.item} class={styles.item}>
          <Combobox.ItemLabel>{props.itemLabel(itemProps.item.rawValue)}</Combobox.ItemLabel>
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
            <div class={styles.chips}>
              <For each={state.selectedOptions()}>
                {(option) => (
                  <span class={styles.chip} {...(props.chipAttrs?.(option) ?? {})}>
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
              <Combobox.Input
                ref={inputRef}
                class={styles.comboInput}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (e.isComposing) {
                    pendingEnterSelect = true;
                    return;
                  }
                  selectFirstMatch();
                }}
                onCompositionEnd={() => {
                  if (pendingEnterSelect) {
                    pendingEnterSelect = false;
                    /* 조합 종료 후 input 이벤트로 값 갱신된 뒤 선택 */
                    queueMicrotask(() => selectFirstMatch());
                  }
                }}
              />
            </div>
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
