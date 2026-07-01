import { Button, Form, Input } from "antd-mobile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePasswordApi } from "../../api/auth";
import { useAuthStore } from "../../store/auth";
import { showError, showSuccess } from "../../utils/toast";

type Props = {
  onDone: () => void;
};

type UpdatePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// 修改密码表单。
// 提交成功后会主动清空登录态，让用户使用新密码重新登录，
// 符合后端 UsersService 中 `密码修改成功，请重新登录` 的设计。
export default function UpdatePasswordForm({ onDone }: Props) {
  const [form] = Form.useForm<UpdatePasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleSubmit(values: UpdatePasswordFormValues) {
    if (values.newPassword !== values.confirmPassword) {
      showError(new Error("两次输入的新密码不一致"));
      return;
    }

    if (values.oldPassword === values.newPassword) {
      showError(new Error("新密码不能与旧密码相同"));
      return;
    }

    setSubmitting(true);
    try {
      await updatePasswordApi({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      showSuccess("密码修改成功，请重新登录");
      onDone();
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error, "密码修改失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      footer={
        <Button block color="primary" type="submit" loading={submitting}>
          修改密码
        </Button>
      }
    >
      <Form.Item
        name="oldPassword"
        label="旧密码"
        rules={[{ required: true, message: "请输入旧密码" }]}
      >
        <Input type="password" placeholder="请输入当前密码" clearable />
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
        <Input type="password" placeholder="至少 8 位，字母 + 数字" clearable />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        rules={[{ required: true, message: "请再次输入新密码" }]}
      >
        <Input type="password" placeholder="再次输入新密码" clearable />
      </Form.Item>
    </Form>
  );
}
