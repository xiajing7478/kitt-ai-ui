import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 前端 dev 端口。避免和后端 4000 冲突，这里显式使用 5173。
    // 也可以在启动时用 `pnpm dev --port <port>` 覆盖。
    port: 5173,
    // 开启后 Vite 会把前端匹配到的请求转发到后端，浏览器不再产生跨域请求。
    proxy: {
      // 所有 /api 开头的请求都会被代理到 NestJS 后端。
      // 例如：前端请求 /api/auth/login → 实际访问 http://localhost:4000/api/auth/login。
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
