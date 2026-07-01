import { apiRequest } from "./client";
import type { AuthResponse, MessageResponse, SafeUser } from "../types/auth";

// 注册。请求体和后端 RegisterDto 保持一致。
export function registerApi(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

// 登录。account 允许传用户名或邮箱。
export function loginApi(payload: { account: string; password: string }) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

// 登出。JWT 基础版登出只需要前端删除本地 token，
// 但仍然调用一下后端接口，便于以后接入 token 黑名单时统一升级。
export function logoutApi() {
  return apiRequest<MessageResponse>("/api/auth/logout", {
    method: "POST",
    auth: true,
  });
}

// 忘记密码。前端提交用户名 + 邮箱 + 新密码，服务端校验通过后重置密码。
export function forgotPasswordApi(payload: {
  username: string;
  email: string;
  newPassword: string;
}) {
  return apiRequest<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

// 获取当前登录用户的资料。
// 这个接口是判断 token 是否仍然有效的最直接方式。
export function fetchMeApi() {
  return apiRequest<SafeUser>("/api/users/me", {
    auth: true,
  });
}

// 修改当前用户的 username 或 email。
export function updateProfileApi(payload: {
  username?: string;
  email?: string;
}) {
  return apiRequest<SafeUser>("/api/users/me", {
    method: "PATCH",
    body: payload,
    auth: true,
  });
}

// 修改当前用户密码，必须提供旧密码。
export function updatePasswordApi(payload: {
  oldPassword: string;
  newPassword: string;
}) {
  return apiRequest<MessageResponse>("/api/users/me/password", {
    method: "PATCH",
    body: payload,
    auth: true,
  });
}
