import { Button, Form, Input } from 'antd-mobile';
import { useState } from 'react';
import { updateProfileApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { showError, showSuccess } from '../../utils/toast';

type Props = {
  onDone: () => void;
};

type UpdateProfileFormValues = {
  username?: string;
  email?: string;
};

// 修改资料表单：用户名和邮箱都是可选字段。
// 允许只修改其中一个字段，未填写的字段后端会保留原值。
export default function UpdateProfileForm({ onDone }: Props) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [form] = Form.useForm<UpdateProfileFormValues>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: UpdateProfileFormValues) {
    const nextUsername = values.username?.trim();
    const nextEmail = values.email?.trim();

    // 组装 payload 时忽略未修改的字段，避免把空字符串传给后端触发不必要的错误。
    const payload: UpdateProfileFormValues = {};
    if (nextUsername && nextUsername !== user?.username) {
      payload.username = nextUsername;
    }
    if (nextEmail && nextEmail !== user?.email) {
      payload.email = nextEmail;
    }

    if (!payload.username && !payload.email) {
      showError(new Error('请至少修改用户名或邮箱其中之一'));
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateProfileApi(payload);
      setUser(updated);
      showSuccess('资料已更新');
      onDone();
    } catch (error) {
      showError(error, '资料更新失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ username: user?.username ?? '', email: user?.email ?? '' }}
      onFinish={handleSubmit}
      footer={
        <Button block color="primary" type="submit" loading={submitting}>
          保存修改
        </Button>
      }
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={[
          {
            pattern: /^[a-zA-Z0-9_]{3,50}$/,
            message: '用户名只能是 3-50 位字母、数字或下划线',
          },
        ]}
      >
        <Input placeholder="不修改可保持原值" clearable />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
        ]}
      >
        <Input placeholder="不修改可保持原值" clearable />
      </Form.Item>
    </Form>
  );
}
