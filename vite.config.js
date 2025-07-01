import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/Tribalism3/",
  root: "src/",
  publicDir: "../public/",
  plugins: [react()],
  server: {
    host: true, // Open to local network and display URL
  },
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
});
