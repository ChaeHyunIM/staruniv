/**
 * run-migration.ts
 * SQL 마이그레이션 파일을 Bun의 bun:sql로 실행한다.
 *
 * 사용법: bun run scripts/run-migration.ts sql/003_add_soop_profile.sql
 */

import { sql } from "bun";
import { join } from "node:path";

const filePath = process.argv[2];
if (!filePath) {
  console.error("사용법: bun run scripts/run-migration.ts <sql-file>");
  process.exit(1);
}

const absPath = filePath.startsWith("/") ? filePath : join(import.meta.dirname, "..", filePath);

const content = await Bun.file(absPath).text();

// 주석 제거 후 SQL 문 분리
const cleaned = content
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = cleaned
  .split(";")
  .map((s) => s.trim())
  .filter((s) => {
    if (s.length === 0) return false;
    const upper = s.toUpperCase();
    if (upper === "BEGIN" || upper === "COMMIT") return false;
    return true;
  });

console.log(`마이그레이션 실행: ${absPath} (${statements.length}개 SQL 문)`);

await sql.begin(async (tx) => {
  for (let i = 0; i < statements.length; i++) {
    try {
      await tx.unsafe(statements[i]);
    } catch (e: any) {
      console.error(`[${i}] 실패: ${statements[i].substring(0, 80)}`);
      throw e;
    }
  }
  console.log(`${statements.length}개 SQL 문 실행 완료`);
});

console.log("마이그레이션 완료!");
process.exit(0);
