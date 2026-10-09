import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/specs/**/*.spec.js"],
    bail: 1,
    server: {
      deps: {
        // Load the CommonJS library natively, so tests and library share the same module instances
        external: [/\/lib\//],
      },
    },
  },
});
