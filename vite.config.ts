import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project-page base path for GitHub Pages (github.com/<user>/deep-run).
export default defineConfig({
  plugins: [react()],
  base: "/deep-run/",
});
