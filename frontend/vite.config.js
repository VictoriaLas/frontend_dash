import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, /api/* (HTTP y el WebSocket /api/ws) se reenvía al backend FastAPI (que no usa prefijo /api).
// Así el navegador ve frontend y API en el mismo origen y la cookie HttpOnly es de primera parte.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.BACKEND_URL || "http://localhost:8000";
  return {
    plugins: [react()],
    // Recharts pesa ~400 kB; se acepta en un solo bundle para una SPA de este tamaño
    build: { chunkSizeWarningLimit: 900 },
    server: {
      port: 5173,
      proxy: {
        "/api": { target: backend, changeOrigin: true, ws: true, rewrite: (path) => path.replace(/^\/api/, "") },
      },
    },
  };
});
