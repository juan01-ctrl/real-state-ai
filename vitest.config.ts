import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 60_000
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  }
});
