import styles from "./filters-skeleton.module.css";

const FIELDS = 6;

export default function FiltersSkeleton() {
  return (
    <div class={styles.skeleton}>
      {Array.from({ length: FIELDS }, () => (
        <div class={styles.field}>
          <div class={styles.label} />
          <div class={styles.control} />
        </div>
      ))}
    </div>
  );
}
