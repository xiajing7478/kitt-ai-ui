import { Button, Form, Input, NavBar } from 'antd-mobile';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { showError, showSuccess } from '../../utils/toast';
import './auth.css';

type LoginFormValues = {
  account: string;
  password: string;
};

// 登录页面。
// 使用 antd-mobile 的 Form 做表单管理，login store 负责实际登录。
export default function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  // 未登录时被 ProtectedRoute 拦截跳回来的用户，登录后可以回跳到原页面。
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/profile';

  async function handleSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      await login(values);
      showSuccess('登录成功');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showError(error, '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <NavBar backArrow={false}>登录</NavBar>

      <div className="auth-page__header">
        <h1 className="auth-page__title">欢迎回到 KITT AI</h1>
        <p className="auth-page__subtitle">使用你的用户名或邮箱登录</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        className="auth-page__form"
        onFinish={handleSubmit}
        footer={
          <div className="auth-page__actions">
            <Button block color="primary" size="large" type="submit" loading={submitting}>
              登录
            </Button>

            <div className="auth-page__links">
              <Link to="/register" className="auth-page__link">
                没有账号？去注册
              </Link>
              <Link to="/forgot-password" className="auth-page__link">
                忘记密码？
              </Link>
            </div>
          </div>
        }
      >
        <Form.Item
          name="account"
          label="账号"
          rules={[{ required: true, message: '请输入用户名或邮箱' }]}
        >
          <Input placeholder="用户名或邮箱" clearable />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input type="password" placeholder="密码" clearable />
        </Form.Item>
      </Form>
    </div>
  );
}
