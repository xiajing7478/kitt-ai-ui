import { Navigate, useLocation } from 'react-router-dom';
import { DotLoading } from 'antd-mobile';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';

type Props = {
  children: ReactNode;
};

// 只有登录后才能访问的路由。
// 未登录会跳转到 /login，并把当前 pathname 记录到 state 中，
// 登录成功后可以自动回跳到之前想要访问的页面。
export function ProtectedRoute({ children }: Props) {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <DotLoading color="primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

// 未登录时才允许访问的路由，例如登录页、注册页、忘记密码页。
// 已登录用户访问这些页面会被自动跳到个人中心，避免重复登录。
export function GuestRoute({ children }: Props) {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <DotLoading color="primary" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
