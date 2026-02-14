import { A } from "@solidjs/router";
import styles from "./Nav.module.css";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav class={styles.nav} aria-label="메인 내비게이션">
      <div class={styles.inner}>
        <A href="/" class={styles.logo}>
          Star<span class={styles.logoAccent}>Univ</span>
        </A>
        <div class={styles.links}>
          <A href="/" class={styles.link} activeClass={styles.linkActive} end>
            Home
          </A>
          <A href="/players" class={styles.link} activeClass={styles.linkActive}>
            Players
          </A>
          <A href="/crews" class={styles.link} activeClass={styles.linkActive}>
            Crews
          </A>
          <A href="/fa" class={styles.link} activeClass={styles.linkActive}>
            FA
          </A>
          <A href="/history" class={styles.link} activeClass={styles.linkActive}>
            History
          </A>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
