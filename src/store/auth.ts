import { create } from 'zustand';
import { fetchMeApi, loginApi, logoutApi, registerApi } from '../api/auth';
import { AUTH_TOKEN_STORAGE_KEY } from '../api/config';
import type { SafeUser } from '../types/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: SafeUser | null;
  token: string | null;
  status: AuthStatus;

  // 使用当前 token 尝试拉取一次用户信息，用来做“刷新页面后自动登录”。
  bootstrap: () => Promise<void>;

  login: (params: { account: string; password: string }) => Promise<void>;
  register: (params: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;

  // 修改资料或修改密码等操作完成后，可以直接把新的 user 写回 store。
  setUser: (user: SafeUser) => void;
};

// Zustand 用于全局共享登录状态。
// 页面组件只需要订阅需要的字段，避免整个应用因为任意状态更新而 re-render。
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
  status: 'idle',

  async bootstrap() {
    const token = get().token;

    // 没有 token 时直接标记为未登录，避免多余的接口请求。
    if (!token) {
      set({ status: 'unauthenticated' });
      return;
    }

    set({ status: 'loading' });

    try {
      // 拿当前 token 去获取一次用户信息。
      // 成功说明 token 仍然有效；失败说明 token 过期或无效，需要重新登录。
      const user = await fetchMeApi();
      set({ user, status: 'authenticated' });
    } catch {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },

  async login({ account, password }) {
    const result = await loginApi({ account, password });

    // 登录成功后把 accessToken 保存到 localStorage，
    // 后续 apiRequest 会自动把它加到 Authorization 请求头。
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.accessToken);

    set({
      user: result.user,
      token: result.accessToken,
      status: 'authenticated',
    });
  },

  async register({ username, email, password }) {
    const result = await registerApi({ username, email, password });

    // 后端在注册成功时也签发了 accessToken，前端直接完成一次自动登录，
    // 让用户不用手动跳转到登录页再输入一次账号密码。
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.accessToken);

    set({
      user: result.user,
      token: result.accessToken,
      status: 'authenticated',
    });
  },

  async logout() {
    // 即使后端调用失败也不要影响前端登出流程，
    // 因为 JWT 无状态设计下前端删除 token 后即可算作登出。
    try {
      await logoutApi();
    } catch {
      // 忽略退出登录时的网络错误
    }

    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    set({ user: null, token: null, status: 'unauthenticated' });
  },

  setUser(user) {
    set({ user });
  },
}));
