import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
    },
    alias: {
        "@": path.resolve(__dirname, "./src"),
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
