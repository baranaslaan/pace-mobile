import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Saf çekirdek mantığı testleri — RN/Expo gerektirmez.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
