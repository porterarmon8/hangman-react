import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": process.env.API_PROXY_TARGET || "http://localhost:3001" },
  },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.js"] },
});
