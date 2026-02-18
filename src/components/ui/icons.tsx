import type { JSX } from "solid-js";
import Check from "lucide-solid/icons/check";
import ChevronDown from "lucide-solid/icons/chevron-down";

/* 체크 아이콘 */
export function CheckIcon(): JSX.Element {
  return <Check size={14} stroke-width={1.8} aria-hidden="true" />;
}

/* 드롭다운 화살표 아이콘 */
export function ChevronIcon(): JSX.Element {
  return <ChevronDown size={12} stroke-width={1.5} aria-hidden="true" />;
}
