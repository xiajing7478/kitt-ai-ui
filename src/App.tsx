import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth";
import { GuestRoute, ProtectedRoute } from "./routes/guards";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import ChatPage from "@/pages/chat/ChatPage";
import "./styles/global.less";

// 应用根组件。
// 1. 应用启动时调用 bootstrap，尝试用本地 token 恢复登录态；
// 2. 使用 react-router-dom 声明路由；
// 3. 通过路由守卫控制未登录、已登录用户能访问的页面。
function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 根路径默认跳转到聊天页面，由 ProtectedRoute 决定是否需要先登录。 */}
        <Route path="/" element={<Navigate to="/chat" replace />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 兜底：未匹配的路径统一跳回根路径。 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
