import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Lets the frontend call same-origin "/api/..." paths in dev, exactly
    // like it does behind nginx in Docker - no CORS, no env-specific base URL.
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
