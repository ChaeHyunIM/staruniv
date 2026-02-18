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
        <ul class={styles.links}>
          <li>
            <A href="/" class={styles.link} activeClass={styles.linkActive} end>
              Home
            </A>
          </li>
          <li>
            <A href="/crews" class={styles.link} activeClass={styles.linkActive}>
              Crews
            </A>
          </li>
          <li>
            <A href="/history" class={styles.link} activeClass={styles.linkActive}>
              History
            </A>
          </li>
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
}
