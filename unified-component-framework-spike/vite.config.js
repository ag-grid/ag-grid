import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  server: {
    open: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        grid: resolve(__dirname, "src/grid/index.html"),
        reorder: resolve(__dirname, "src/reorder/index.html"),
      },
    },
  },
});
