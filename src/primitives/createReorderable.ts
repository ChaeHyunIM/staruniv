import { createSignal, type Accessor } from "solid-js";

export interface CreateReorderableOptions<T> {
  /** 반응형 아이템 목록 */
  items: Accessor<T[]>;
  /** 고유 식별자 추출 */
  key: (item: T) => string | number;
  /** 순서 변경 콜백 */
  onReorder: (items: T[]) => void;
  /** 드래그 방향. 기본 "vertical" */
  orientation?: "vertical" | "horizontal";
}

export interface ReorderableItemState {
  /** 현재 드래그 중인 아이템인지 */
  readonly isDragging: boolean;
  /** 드롭 인디케이터 위치 */
  readonly dropIndicator: "before" | "after" | null;
}

export interface ReorderableItemHandlers {
  draggable: true;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onDragEnd: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export interface ReorderableReturn<T> {
  /** 드래그 중인 아이템 */
  activeItem: Accessor<T | null>;
  /** 아이템별 DnD 상태 (반응형 getter) */
  itemState(item: T): ReorderableItemState;
  /** 아이템에 바인딩할 이벤트 핸들러 */
  itemHandlers(item: T): ReorderableItemHandlers;
  /** 프로그래밍 방식 이동. 새 index를 반환하며 -1이면 이동 불가 */
  move(item: T, delta: number): number;
}

export function createReorderable<T>(options: CreateReorderableOptions<T>): ReorderableReturn<T> {
  const [dragItem, setDragItem] = createSignal<T | null>(null);
  const [dropTarget, setDropTarget] = createSignal<{
    key: string | number;
    position: "before" | "after";
  } | null>(null);

  const orientation = () => options.orientation ?? "vertical";

  /** splice 기반 reorder — DnD와 keyboard 공용 */
  const reorder = (fromIndex: number, toIndex: number): void => {
    const items = [...options.items()];
    if (
      fromIndex < 0 ||
      fromIndex >= items.length ||
      toIndex < 0 ||
      toIndex >= items.length ||
      fromIndex === toIndex
    )
      return;

    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    options.onReorder(items);
  };

  const findIndex = (item: T): number => {
    const k = options.key(item);
    return options.items().findIndex((i) => options.key(i) === k);
  };

  const findByKey = (key: string | number): T | undefined =>
    options.items().find((i) => options.key(i) === key);

  /* ── Public API ── */

  const activeItem: Accessor<T | null> = dragItem;

  const itemState = (item: T): ReorderableItemState => {
    const k = options.key(item);
    return Object.defineProperties({} as ReorderableItemState, {
      isDragging: {
        get: () => {
          const d = dragItem();
          return d != null && options.key(d) === k;
        },
        enumerable: true,
      },
      dropIndicator: {
        get: () => {
          const dt = dropTarget();
          if (!dt || dt.key !== k) return null;
          return dt.position;
        },
        enumerable: true,
      },
    });
  };

  const itemHandlers = (item: T): ReorderableItemHandlers => ({
    draggable: true as const,

    onDragStart: (e: DragEvent) => {
      setDragItem(() => item);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(options.key(item)));
      }
    },

    onDragOver: (e: DragEvent) => {
      if (!dragItem()) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const isVertical = orientation() === "vertical";
      const pos = isVertical ? e.clientY : e.clientX;
      const mid = isVertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;

      setDropTarget({ key: options.key(item), position: pos < mid ? "before" : "after" });
    },

    onDragLeave: () => {
      setDropTarget(null);
    },

    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const drag = dragItem();
      const dt = dropTarget();
      if (!drag || !dt) {
        setDragItem(null);
        setDropTarget(null);
        return;
      }

      const dropItem = findByKey(dt.key);
      if (!dropItem || options.key(drag) === dt.key) {
        setDragItem(null);
        setDropTarget(null);
        return;
      }

      const items = [...options.items()];
      const fromIndex = items.findIndex((i) => options.key(i) === options.key(drag));
      if (fromIndex === -1) return;

      items.splice(fromIndex, 1);

      let toIndex = items.findIndex((i) => options.key(i) === dt.key);
      if (toIndex === -1) return;
      if (dt.position === "after") toIndex++;

      items.splice(toIndex, 0, drag);
      options.onReorder(items);

      setDragItem(null);
      setDropTarget(null);
    },

    onDragEnd: () => {
      setDragItem(null);
      setDropTarget(null);
    },

    onKeyDown: (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const isVertical = orientation() === "vertical";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

      if (e.key !== prevKey && e.key !== nextKey) return;

      e.preventDefault();
      const delta = e.key === prevKey ? -1 : 1;
      move(item, delta);
    },
  });

  const move = (item: T, delta: number): number => {
    const idx = findIndex(item);
    if (idx === -1) return -1;

    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= options.items().length) return -1;

    reorder(idx, newIdx);
    return newIdx;
  };

  return { activeItem, itemState, itemHandlers, move };
}
