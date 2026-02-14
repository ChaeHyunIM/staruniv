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
    <div class={styles.filters}>
      <div class={styles.field}>
        <label class={styles.label}>종족</label>
        <select
          class={styles.select}
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
        <label class={styles.label}>티어</label>
        <select
          class={styles.select}
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
        <label class={styles.label}>성별</label>
        <select
          class={styles.select}
          value={searchParams.gender ?? ""}
          onChange={(e) => update("gender", e.currentTarget.value)}
        >
          <option value="">전체</option>
          <option value="M">남</option>
          <option value="F">여</option>
        </select>
      </div>

      <div class={styles.field}>
        <label class={styles.label}>검색</label>
        <input
          type="text"
          class={styles.input}
          placeholder="닉네임 검색..."
          value={searchParams.search ?? ""}
          onInput={(e) => update("search", e.currentTarget.value)}
        />
      </div>

      {hasAnyFilter() && (
        <button class={styles.reset} onClick={resetAll}>
          초기화
        </button>
      )}
    </div>
  );
}
