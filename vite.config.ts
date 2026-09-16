import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") {
            return "background.js";
          }

          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
