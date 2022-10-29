import { defineConfig } from "vite";
import * as dotenv from "dotenv";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config();
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // with options
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
