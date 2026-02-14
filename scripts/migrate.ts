import { sql } from "bun";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const SQL_DIR = join(import.meta.dirname, "..", "sql");

async function migrate() {
  const files = await readdir(SQL_DIR);
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();

  console.log(`Found ${sqlFiles.length} migration file(s)`);

  for (const file of sqlFiles) {
    const path = join(SQL_DIR, file);
    const content = await Bun.file(path).text();
    console.log(`Running: ${file}...`);
    await sql.unsafe(content);
    console.log(`  Done: ${file}`);
  }

  console.log("All migrations completed.");
  await sql.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
