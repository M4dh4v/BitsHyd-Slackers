import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pfront = process.env.PORT_FRONT;
const pback = process.env.PORT_BACK;
const API_BASE_URL = `${process.env.BASE}:${pback}`;

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: pfront,
    proxy: {
      "/api": {
        target: `${API_BASE_URL}`,
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  plugins: [react()],
});
