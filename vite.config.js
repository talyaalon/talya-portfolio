import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config — local dev proxies /api/* to the Netlify dev functions server
// so analytics works the same locally as in production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
