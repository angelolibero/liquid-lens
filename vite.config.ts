import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  /* GitHub Pages serves this from /liquid-lens/, so the built asset URLs have
     to carry the repo name. Change it if you fork under another name, or set
     it to "/" if you deploy at a domain root. */
  base: "/liquid-lens/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
