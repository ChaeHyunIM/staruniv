import { useSearchParams } from "@solidjs/router";
import styles from "./PlayerFilters.module.css";

export default function PlayerFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

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
      <div class={styles.field}>
        <label for="filter-race" class={styles.label}>종족</label>
        <select
          id="filter-race"
          name="race"
          class={styles.select}
          autocomplete="off"
          value={searchParams.race ?? ""}
          onChange={(e) => update("race", e.currentTarget.value)}
        >
          <option value="">전체</option>
          <option value="T">Terran</option>
          <option value="Z">Zerg</option>
          <option value="P">Protoss</option>
        </select>
      </div>

      <div class={styles.field}>
        <label for="filter-tier" class={styles.label}>티어</label>
        <select
          id="filter-tier"
          name="tier"
          class={styles.select}
          autocomplete="off"
          value={searchParams.tier ?? ""}
          onChange={(e) => update("tier", e.currentTarget.value)}
        >
          <option value="">전체</option>
          <option value="S">S</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div class={styles.field}>
        <label for="filter-gender" class={styles.label}>성별</label>
        <select
          id="filter-gender"
          name="gender"
          class={styles.select}
          autocomplete="off"
          value={searchParams.gender ?? ""}
          onChange={(e) => update("gender", e.currentTarget.value)}
        >
          <option value="">전체</option>
          <option value="M">남</option>
          <option value="F">여</option>
        </select>
      </div>

      <div class={styles.field}>
        <label for="filter-search" class={styles.label}>검색</label>
        <input
          id="filter-search"
          type="search"
          name="search"
          class={styles.input}
          placeholder="닉네임 검색\u2026"
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
