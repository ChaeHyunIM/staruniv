import { createSignal, createEffect, onMount, Show } from "solid-js";
import Sun from "lucide-solid/icons/sun";
import Moon from "lucide-solid/icons/moon";
import styles from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const [dark, setDark] = createSignal(false);

  onMount(() => {
    setDark(document.documentElement.classList.contains("dark"));
  });

  createEffect(() => {
    const isDark = dark();
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    /* 모바일 브라우저 상태바 색상 동기화 */
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#302e3b" : "#fbfaf9");
  });

  return (
    <button
      class={styles.toggle}
      onClick={() => setDark((prev) => !prev)}
      aria-label="테마 전환"
      title={dark() ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      <Show
        when={dark()}
        fallback={
          <Sun class={`${styles.icon} ${styles.sun}`} size={18} aria-hidden="true" />
        }
      >
        <Moon class={`${styles.icon} ${styles.moon}`} size={18} aria-hidden="true" />
      </Show>
    </button>
  );
}
