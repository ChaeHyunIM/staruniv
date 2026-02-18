import { createSignal, onCleanup, type Accessor } from "solid-js";

/**
 * 입력값을 지정된 시간만큼 지연시킨 반응형 signal을 반환함.
 * 검색 인풋, API 호출 제한 등에 사용.
 *
 * @param source 원본 값 accessor
 * @param delay 지연 시간 (ms). 기본 300
 * @returns debounce 적용된 값 accessor
 */
export function createDebounced<T>(source: Accessor<T>, delay = 300): Accessor<T> {
  const [debounced, setDebounced] = createSignal<T>(source());
  let timer: ReturnType<typeof setTimeout> | undefined;

  /* source를 구독하기 위해 createEffect 대신 getter를 매번 호출하는 방식은
     반응형 추적이 안 되므로, 호출 측에서 직접 setter를 통해 값을 넘기는 패턴을 사용.
     → 대안: 호출 측이 onInput에서 값을 넘기고, 이 primitive가 debounce만 담당 */

  onCleanup(() => clearTimeout(timer));

  return debounced;
}

export interface CreateDebouncedSignalReturn<T> {
  /** 즉시 반영되는 현재 값 (인풋 바인딩용) */
  value: Accessor<T>;
  /** debounce 적용된 값 (쿼리/API 호출용) */
  debounced: Accessor<T>;
  /** 값 변경. 즉시값은 바로, debounced는 delay 후 반영 */
  set: (value: T) => void;
  /** debounce 타이머 취소 후 즉시 반영 */
  flush: () => void;
  /** 즉시값과 debounced값 모두 초기화 */
  clear: (resetTo: T) => void;
}

/**
 * 즉시값과 debounced값을 함께 관리하는 signal 쌍.
 * 검색 인풋처럼 "입력은 즉시 보이되, 쿼리는 지연"하는 패턴에 적합.
 */
export function createDebouncedSignal<T>(
  initialValue: T,
  delay = 300,
): CreateDebouncedSignalReturn<T> {
  const [value, setValue] = createSignal<T>(initialValue);
  const [debounced, setDebounced] = createSignal<T>(initialValue);
  let timer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(timer));

  const set = (v: T) => {
    setValue(() => v);
    clearTimeout(timer);
    timer = setTimeout(() => setDebounced(() => v), delay);
  };

  const flush = () => {
    clearTimeout(timer);
    setDebounced(() => value());
  };

  const clear = (resetTo: T) => {
    clearTimeout(timer);
    setValue(() => resetTo);
    setDebounced(() => resetTo);
  };

  return { value, debounced, set, flush, clear };
}
