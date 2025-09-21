import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: [
      "@tensorflow/tfjs",
      "@tensorflow/tfjs-layers",
      "@tensorflow/tfjs-backend-webgl",
      "@tensorflow-models/mobilenet",
    ],
    exclude: [], // No excluye nada para asegurar bundling correcto
  },
  define: {
    global: "globalThis", // TF.js necesita 'global' en browser
  },
  build: {
    rollupOptions: {
      external: [], // Incluye todo en el bundle
    },
  },
  server: {
    fs: {
      strict: false, // Permite acceso a node_modules si es necesario
    },
  },
});
