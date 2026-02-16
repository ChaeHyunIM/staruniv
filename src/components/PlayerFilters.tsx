import { useSearchParams } from "@solidjs/router";
import { Select } from "@kobalte/core/select";
import { For, Show } from "solid-js";
import { TIER_ORDER, type Tier, type Race, type Gender } from "~/lib/types";
import styles from "./PlayerFilters.module.css";

const RACE_OPTIONS: Race[] = ["T", "Z", "P"];
const RACE_LABELS: Record<Race, string> = { T: "Terran", Z: "Zerg", P: "Protoss" };
const RACE_CSS: Record<Race, string> = { T: "terran", Z: "zerg", P: "protoss" };

const GENDER_OPTIONS: Gender[] = ["M", "F"];
const GENDER_LABELS: Record<Gender, string> = { M: "남", F: "여" };

/* 티어 → CSS 변수 접미어 매핑 */
const TIER_CSS: Record<Tier, string> = {
  God: "god", King: "king", Jack: "jack", Joker: "joker", Spade: "spade",
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
  "5": "5", "6": "6", "7": "7", "8": "8", Baby: "baby",
};

/* 체크 아이콘 */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M11.5 3.5L5.5 10L2.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

/* 드롭다운 화살표 아이콘 */
function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export default function PlayerFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* 콤마 구분 → 배열 파싱 */
  const selectedRaces = (): Race[] =>
    searchParams.race ? (searchParams.race as string).split(",") as Race[] : [];
  const selectedTiers = (): Tier[] =>
    searchParams.tier ? (searchParams.tier as string).split(",") as Tier[] : [];
  const selectedGender = (): Gender | null =>
    (searchParams.gender as Gender) || null;

  const update = (key: string, value: string) => {
    setSearchParams({ [key]: value || undefined });
  };

  const resetAll = () => {
    setSearchParams({
      race: undefined,
      tier: undefined,
      crew: undefined,
      gender: undefined,
      search: undefined,
    });
  };

  const hasAnyFilter = () =>
    !!(searchParams.race || searchParams.tier || searchParams.crew || searchParams.gender || searchParams.search);

  return (
    <div class={styles.filters} role="search" aria-label="선수 필터">
      {/* ── 종족 Multi-Select ── */}
      <Select<Race>
        multiple
        class={styles.field}
        options={RACE_OPTIONS}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => RACE_LABELS[opt]}
        value={selectedRaces()}
        onChange={(values) => {
          setSearchParams({ race: values.length ? values.join(",") : undefined });
        }}
        placeholder="전체"
        itemComponent={(props) => (
          <Select.Item item={props.item} class={styles.item}>
            <Select.ItemLabel class={styles.itemLabel}>
              <span class={styles.itemDot} data-race={RACE_CSS[props.item.rawValue]} />
              {RACE_LABELS[props.item.rawValue]}
            </Select.ItemLabel>
            <Select.ItemIndicator class={styles.itemIndicator}>
              <CheckIcon />
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Label class={styles.label}>종족</Select.Label>
        <Select.Trigger class={styles.trigger}>
          <Select.Value<Race>>
            {(state) => (
              <Show
                when={state.selectedOptions().length > 0}
                fallback={<span class={styles.placeholder}>전체</span>}
              >
                <div class={styles.chips}>
                  <For each={state.selectedOptions()}>
                    {(option) => (
                      <span class={styles.chip} data-race={RACE_CSS[option]}>
                        {RACE_LABELS[option]}
                        <button
                          class={styles.chipRemove}
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            state.remove(option);
                          }}
                          aria-label={`${RACE_LABELS[option]} 제거`}
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

      {/* ── 티어 Multi-Select ── */}
      <Select<Tier>
        multiple
        class={styles.field}
        options={[...TIER_ORDER]}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => opt}
        value={selectedTiers()}
        onChange={(values) => {
          setSearchParams({ tier: values.length ? values.join(",") : undefined });
        }}
        placeholder="전체"
        itemComponent={(props) => (
          <Select.Item item={props.item} class={styles.item}>
            <Select.ItemLabel class={styles.itemLabel}>
              <span class={styles.itemDot} data-tier={TIER_CSS[props.item.rawValue]} />
              {props.item.rawValue}
            </Select.ItemLabel>
            <Select.ItemIndicator class={styles.itemIndicator}>
              <CheckIcon />
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Label class={styles.label}>티어</Select.Label>
        <Select.Trigger class={styles.trigger}>
          <Select.Value<Tier>>
            {(state) => (
              <Show
                when={state.selectedOptions().length > 0}
                fallback={<span class={styles.placeholder}>전체</span>}
              >
                <div class={styles.chips}>
                  <For each={state.selectedOptions()}>
                    {(option) => (
                      <span class={styles.chip} data-tier={TIER_CSS[option]}>
                        {option}
                        <button
                          class={styles.chipRemove}
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            state.remove(option);
                          }}
                          aria-label={`${option} 티어 제거`}
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

      {/* ── 성별 Single-Select ── */}
      <Select<Gender>
        class={styles.field}
        options={GENDER_OPTIONS}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => GENDER_LABELS[opt]}
        value={selectedGender()}
        onChange={(value) => {
          setSearchParams({ gender: value || undefined });
        }}
        placeholder="전체"
        itemComponent={(props) => (
          <Select.Item item={props.item} class={styles.item}>
            <Select.ItemLabel>{GENDER_LABELS[props.item.rawValue]}</Select.ItemLabel>
            <Select.ItemIndicator class={styles.itemIndicator}>
              <CheckIcon />
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Label class={styles.label}>성별</Select.Label>
        <Select.Trigger class={styles.trigger}>
          <Select.Value<Gender>>
            {(state) => (
              <Show
                when={state.selectedOption()}
                fallback={<span class={styles.placeholder}>전체</span>}
              >
                {GENDER_LABELS[state.selectedOption()]}
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

      {/* ── 검색 ── */}
      <div class={styles.field}>
        <label for="filter-search" class={styles.label}>검색</label>
        <input
          id="filter-search"
          type="search"
          name="search"
          class={styles.input}
          placeholder="닉네임 검색…"
          spellcheck={false}
          autocomplete="off"
          value={searchParams.search ?? ""}
          onInput={(e) => update("search", e.currentTarget.value)}
        />
      </div>

      {hasAnyFilter() && (
        <button class={styles.reset} onClick={resetAll} aria-label="모든 필터 초기화">
          초기화
        </button>
      )}
    </div>
  );
}
