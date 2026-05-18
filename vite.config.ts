import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local dev + production build use standard Vite.
// Cloudflare Worker + D1 deploy via `npm run deploy` (wrangler.jsonc).
export default defineConfig({
  plugins: [react()],
  base: "/",
});
