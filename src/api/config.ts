// 后端服务的基础地址。
// 开发环境下 Vite 已经把 /api 请求代理到后端（见 vite.config.ts 的 server.proxy），
// 所以这里默认使用空字符串，让 fetch 走同源相对路径，浏览器不会产生跨域请求。
// 生产部署时可以通过 VITE_API_BASE_URL 环境变量指定后端地址，例如 https://api.example.com。
const DEFAULT_BASE_URL = "";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE_URL;

// 本地保存 JWT 的 key。
// 单独抽出常量，方便在 store、guards、拦截器里统一读取。
export const AUTH_TOKEN_STORAGE_KEY = "kitt-ai:access-token";
