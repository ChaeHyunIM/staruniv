import { createSignal, onMount, type Accessor, type Setter } from "solid-js";

export interface CreateLocalStorageOptions<T> {
  /** 직렬화 함수. 기본 String() */
  serialize?: (value: T) => string;
  /** 역직렬화 함수. 기본 identity (string 그대로) */
  deserialize?: (raw: string) => T;
  /** 역직렬화된 값의 유효성 검증. false면 기본값 사용 */
  validate?: (value: T) => boolean;
}

/**
 * localStorage와 양방향 동기화되는 signal.
 * SSR에서는 기본값만 반환하고, onMount 후 클라이언트에서 복원함.
 */
export function createLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: CreateLocalStorageOptions<T>,
): [Accessor<T>, Setter<T>] {
  const serialize = options?.serialize ?? String;
  const deserialize = options?.deserialize ?? ((raw: string) => raw as unknown as T);
  const validate = options?.validate;

  const [value, setValue] = createSignal<T>(defaultValue);

  onMount(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      const parsed = deserialize(raw);
      if (validate && !validate(parsed)) return;
      setValue(() => parsed);
    } catch { /* 손상된 데이터 무시 */ }
  });

  /* 원본 setter를 감싸서 localStorage에도 기록 */
  const setAndPersist: Setter<T> = ((...args: unknown[]) => {
    const result = (setValue as (...a: unknown[]) => T)(...args);
    try {
      localStorage.setItem(key, serialize(result));
    } catch { /* quota 초과 등 무시 */ }
    return result;
  }) as Setter<T>;

  return [value, setAndPersist];
}
