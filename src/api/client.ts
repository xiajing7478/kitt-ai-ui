import { API_BASE_URL, AUTH_TOKEN_STORAGE_KEY } from "./config";

// 统一的接口错误类型。
// 页面组件通过 error.message 就能拿到后端返回的可读错误信息。
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  // 是否需要携带 Authorization 请求头。
  // 登录、注册、忘记密码等接口不需要 token；用户信息、修改资料、修改密码等接口需要 token。
  auth?: boolean;
};

/**
 * 从后端错误体里提取用户可读的错误信息。
 * NestJS 的 ValidationPipe 会返回类似：{ message: ["用户名格式不正确", "..."] }。
 * 这里把数组拼接成一句话，避免弹窗只显示 [object Object]。
 */
function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return (
      message.filter((item) => typeof item === "string").join("；") || fallback
    );
  }

  if (typeof message === "string") {
    return message;
  }

  return fallback;
}

/**
 * 前端统一的 HTTP 请求入口。
 * 1. 自动拼接后端基础地址；
 * 2. 自动加上 JSON 请求头；
 * 3. 需要登录的接口自动补 Authorization 请求头；
 * 4. 出错时统一抛出 ApiError，页面只需要 try/catch。
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 有些接口即便成功也可能没有响应体（例如 204），这里做兼容。
  const rawText = await response.text();
  const payload = rawText ? safeParseJson(rawText) : undefined;

  if (!response.ok) {
    const message = extractErrorMessage(
      payload,
      `请求失败：${response.status}`,
    );
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
