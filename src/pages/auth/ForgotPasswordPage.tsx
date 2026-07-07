import { Button, Form, Input, NavBar } from "antd-mobile";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { forgotPasswordApi } from "../../api/auth";
import { showError, showSuccess } from "../../utils/toast";
import styles from "./auth.module.less";

type ForgotPasswordFormValues = {
  username: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
};

// 忘记密码页面。
// 使用“用户名 + 邮箱 + 新密码”的基础方案：
// 后端会校验用户名和邮箱是否属于同一账号，成功后重置密码。
// 后续接入邮箱验证码或验证码后，只需要给这个表单加一个 code 字段即可。
export default function ForgotPasswordPage() {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(values: ForgotPasswordFormValues) {
    if (values.newPassword !== values.confirmPassword) {
      showError(new Error("两次输入的新密码不一致"));
      return;
    }

    setSubmitting(true);
    try {
      await forgotPasswordApi({
        username: values.username,
        email: values.email,
        newPassword: values.newPassword,
      });
      showSuccess("密码重置成功，请重新登录");
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error, "密码重置失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles["auth-page"]}>
      <NavBar onBack={() => navigate(-1)}>找回密码</NavBar>

      <div className={styles["auth-page__header"]}>
        <h1 className={styles["auth-page__title"]}>重置账号密码</h1>
        <p className={styles["auth-page__subtitle"]}>
          请输入注册时使用的用户名和邮箱，两者匹配后即可设置新密码
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        className={styles["auth-page__form"]}
        onFinish={handleSubmit}
        footer={
          <div className={styles["auth-page__actions"]}>
            <Button
              block
              color="primary"
              size="large"
              type="submit"
              loading={submitting}
            >
              重置密码
            </Button>

            <div className={styles["auth-page__links"]}>
              <Link to="/login" className={styles["auth-page__link"]}>
                返回登录
              </Link>
              <Link to="/register" className={styles["auth-page__link"]}>
                去注册新账号
              </Link>
            </div>
          </div>
        }
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="注册时使用的用户名" clearable />
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
          <Input placeholder="注册时使用的邮箱" clearable />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: "请输入新密码" },
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
          label="确认新密码"
          rules={[{ required: true, message: "请再次输入新密码" }]}
        >
          <Input type="password" placeholder="再次输入新密码" clearable />
        </Form.Item>
      </Form>
    </div>
  );
}
