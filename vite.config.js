import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@tensorflow/tfjs",
      "@tensorflow/tfjs-layers",
      "@tensorflow/tfjs-backend-webgl",
      "@tensorflow-models/mobilenet",
    ],
    exclude: [],
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
