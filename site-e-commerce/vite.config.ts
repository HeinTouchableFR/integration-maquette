import react from "@vitejs/plugin-react";
import { resolve } from "path";

const root = "./assets";

/**
 * Rafraichi la page quand on modifie un fichier twig
 */
const twigRefreshPlugin = {
  name: "twig-refresh",
  configureServer({ watcher, ws }) {
    watcher.add(resolve(__dirname, "templates/**/*.twig"));
    watcher.on("change", function (path) {
      if (path.endsWith(".twig")) {
        ws.send({
          type: "full-reload",
        });
      }
    });
  },
};

/**
 * @type { import('vite').UserConfig }
 */
const config = {
  emitManifest: true,
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  base: "/assets/",
  server: {
    host: true,
    watch: {
      disableGlobbing: false,
    },
  },
  build: {
    polyfillDynamicImport: false,
    assetsDir: "",
    manifest: true,
    outDir: "../public/assets/",
    rollupOptions: {
      output: {
        manualChunks: undefined, // Désactive la séparation du vendor
      },
      input: {
        app: resolve(__dirname, "assets/app.ts"),
        admin: resolve(__dirname, "assets/admin.ts"),
      },
    },
  },
  plugins: [react(), twigRefreshPlugin],
  root,
};

module.exports = config;
