import { Button, Form, Input, NavBar } from "antd-mobile";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/auth";
import { showError, showSuccess } from "../../utils/toast";
import "./auth.css";

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// 注册页面。
// 后端 RegisterDto 已经使用 class-validator 校验用户名/邮箱/密码格式，
// 前端在提交前再做一次校验，能给用户更及时的反馈。
export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  async function handleSubmit(values: RegisterFormValues) {
    if (values.password !== values.confirmPassword) {
      showError(new Error("两次输入的密码不一致"));
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      showSuccess("注册成功，已自动登录");
      navigate("/profile", { replace: true });
    } catch (error) {
      showError(error, "注册失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <NavBar onBack={() => navigate(-1)}>注册</NavBar>

      <div className="auth-page__header">
        <h1 className="auth-page__title">创建 KITT AI 账号</h1>
        <p className="auth-page__subtitle">注册成功后会自动登录</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        className="auth-page__form"
        onFinish={handleSubmit}
        footer={
          <div className="auth-page__actions">
            <Button
              block
              color="primary"
              size="large"
              type="submit"
              loading={submitting}
            >
              注册
            </Button>

            <div className="auth-page__links">
              <Link to="/login" className="auth-page__link">
                已有账号？去登录
              </Link>
            </div>
          </div>
        }
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: "请输入用户名" },
            {
              pattern: /^[a-zA-Z0-9_]{3,50}$/,
              message: "用户名只能是 3-50 位字母、数字或下划线",
            },
          ]}
        >
          <Input placeholder="3-50 位字母/数字/下划线" clearable />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            {
              type: "string",
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "邮箱格式不正确",
            },
          ]}
        >
          <Input placeholder="用于登录和找回密码" clearable />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: "请输入密码" },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
              message: "密码至少 8 位，且需包含字母和数字",
            },
          ]}
        >
          <Input
            type="password"
            placeholder="至少 8 位，字母 + 数字"
            clearable
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          rules={[{ required: true, message: "请再次输入密码" }]}
        >
          <Input type="password" placeholder="再次输入密码" clearable />
        </Form.Item>
      </Form>
    </div>
  );
}
