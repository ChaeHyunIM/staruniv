import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    rollupConfig: {
      external: ["bun", "bun:sql"],
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["bun", "bun:sql"],
      },
    },
  },
});
