import { useSearchParams, createAsync } from "@solidjs/router";
import { createEffect, on, Show } from "solid-js";
import {
  TIER_ORDER,
  type Tier,
  type Race,
  type Gender,
  type CrewWithCount,
} from "~/lib/types";
import { getCrews } from "~/lib/queries/crews";
import { MultiSelect, SingleSelect, MultiCombobox } from "~/components/ui/select";
import { createDebouncedSignal } from "~/primitives/createDebounced";
import LayoutToggle, { type CardVariant } from "~/components/layout-toggle";
import styles from "./player-filters.module.css";

/* FA를 크루 콤보박스의 특수 옵션으로 표현 */
const FA_SENTINEL: CrewWithCount = {
  id: -1,
  name: "FA",
  is_active: true,
  created_at: "",
  updated_at: "",
  member_count: 0,
};

const RACE_OPTIONS: Race[] = ["T", "Z", "P"];
const RACE_LABELS: Record<Race, string> = {
  T: "Terran",
  Z: "Zerg",
  P: "Protoss",
};
const RACE_CSS: Record<Race, string> = { T: "terran", Z: "zerg", P: "protoss" };

type GenderOption = Gender | "ALL";
const GENDER_OPTIONS: GenderOption[] = ["ALL", "M", "F"];
const GENDER_LABELS: Record<GenderOption, string> = { ALL: "전체", M: "남", F: "여" };

/* 티어 → CSS 변수 접미어 매핑 */
const TIER_CSS: Record<Tier, string> = {
  God: "god",
  King: "king",
  Jack: "jack",
  Joker: "joker",
  Spade: "spade",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  Baby: "baby",
};

interface Props {
  cardVariant: CardVariant;
  onVariantChange: (variant: CardVariant) => void;
}

export default function PlayerFilters(props: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const crews = createAsync(() => getCrews());

  /* ── 검색어 debounce (300ms) ── */
  const search = createDebouncedSignal((searchParams.search as string) ?? "", 300);

  /* debounced 값 변경 시 URL 파라미터에 반영 */
  createEffect(on(() => search.debounced(), (val) => {
    update("search", val);
  }, { defer: true }));

  /* 콤마 구분 → 배열 파싱 */
  const selectedRaces = (): Race[] =>
    searchParams.race
      ? ((searchParams.race as string).split(",") as Race[])
      : [];
  const selectedTiers = (): Tier[] =>
    searchParams.tier
      ? ((searchParams.tier as string).split(",") as Tier[])
      : [];

  /* 크루 옵션 목록 (FA를 맨 앞에 추가) */
  const crewOptions = (): CrewWithCount[] => [FA_SENTINEL, ...(crews() ?? [])];

  /* URL 파라미터와 매칭되는 크루 객체 배열 */
  const selectedCrews = (): CrewWithCount[] => {
    const param = searchParams.crew as string | undefined;
    if (!param) return [];
    const names = param.split(",");
    const list = crewOptions();
    return names.flatMap((n) => {
      const found = list.find((c) => c.name === n);
      return found ? [found] : [];
    });
  };
  const selectedGender = (): GenderOption =>
    (searchParams.gender as Gender) || "ALL";

  const update = (key: string, value: string) => {
    setSearchParams({ [key]: value || undefined });
  };

  const resetAll = () => {
    search.clear("");
    setSearchParams({
      race: undefined,
      tier: undefined,
      crew: undefined,
      gender: undefined,
      search: undefined,
    });
  };

  const hasAnyFilter = () =>
    !!(
      searchParams.race ||
      searchParams.tier ||
      searchParams.crew ||
      searchParams.gender ||
      searchParams.search
    );

  return (
    <div class={styles.filters} role="search" aria-label="선수 필터">
      {/* ── 종족 ── */}
      <MultiSelect<Race>
        class={styles.filterField}
        label="종족"
        options={RACE_OPTIONS}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => RACE_LABELS[opt]}
        value={selectedRaces()}
        onChange={(values) =>
          setSearchParams({
            race: values.length ? values.join(",") : undefined,
          })
        }
        itemLabel={(opt) => (
          <>
            <span class={styles.itemDot} data-race={RACE_CSS[opt]} />
            {RACE_LABELS[opt]}
          </>
        )}
        chipLabel={(opt) => RACE_LABELS[opt]}
        chipAttrs={(opt) => ({ "data-race": RACE_CSS[opt] })}
      />

      {/* ── 티어 ── */}
      <MultiSelect<Tier>
        class={styles.filterField}
        label="티어"
        options={[...TIER_ORDER]}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => opt}
        value={selectedTiers()}
        onChange={(values) =>
          setSearchParams({
            tier: values.length ? values.join(",") : undefined,
          })
        }
        itemLabel={(opt) => (
          <>
            <span class={styles.itemDot} data-tier={TIER_CSS[opt]} />
            {opt}
          </>
        )}
        chipLabel={(opt) => opt}
        chipAttrs={(opt) => ({ "data-tier": TIER_CSS[opt] })}
      />

      {/* ── 성별 ── */}
      <SingleSelect<GenderOption>
        class={styles.filterField}
        label="성별"
        options={GENDER_OPTIONS}
        optionValue={(opt) => opt}
        optionTextValue={(opt) => GENDER_LABELS[opt]}
        value={selectedGender()}
        onChange={(value) =>
          setSearchParams({ gender: value === "ALL" ? undefined : value ?? undefined })
        }
        itemLabel={(opt) => <>{GENDER_LABELS[opt]}</>}
        selectedLabel={(opt) => GENDER_LABELS[opt]}
      />

      {/* ── 스타대학 (FA 포함) ── */}
      <MultiCombobox<CrewWithCount>
        class={styles.filterField}
        label="스타대학"
        options={crewOptions()}
        optionValue="name"
        optionTextValue="name"
        optionLabel="name"
        defaultFilter="contains"
        value={selectedCrews()}
        onChange={(values) =>
          setSearchParams({
            crew: values.length
              ? values.map((c) => c.name).join(",")
              : undefined,
          })
        }
        itemLabel={(opt) => <>{opt.name}</>}
        chipLabel={(opt) => opt.name}
      />

      {/* ── 검색 ── */}
      <div class={styles.field}>
        <label for="filter-search" class={styles.label}>
          검색
        </label>
        <input
          id="filter-search"
          type="search"
          name="search"
          class={styles.input}
          placeholder="닉네임 검색…"
          spellcheck={false}
          autocomplete="off"
          value={search.value()}
          onInput={(e) => search.set(e.currentTarget.value)}
        />
      </div>

      {/* ── 보기 방식 ── */}
      <div class={styles.field}>
        <span class={styles.label}>보기</span>
        <LayoutToggle value={props.cardVariant} onChange={props.onVariantChange} />
      </div>

      <Show when={hasAnyFilter()}>
        <button
          class={styles.reset}
          onClick={resetAll}
          aria-label="모든 필터 초기화"
        >
          초기화
        </button>
      </Show>
    </div>
  );
}
