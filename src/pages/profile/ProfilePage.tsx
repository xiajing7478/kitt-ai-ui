import { Button, List, NavBar, Popup } from "antd-mobile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { showError, showSuccess } from "../../utils/toast";
import UpdateProfileForm from "./UpdateProfileForm";
import UpdatePasswordForm from "./UpdatePasswordForm";
import styles from "./profile.module.less";

// 个人中心页面。
// 展示当前登录用户资料，并提供“修改资料”“修改密码”“退出登录”入口。
// 修改表单使用 antd-mobile 的 Popup 抽屉展示，避免额外的路由跳转。
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [profileVisible, setProfileVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      showSuccess("已退出登录");
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error, "退出失败");
    }
  }

  return (
    <div className={styles["profile-page"]}>
      <NavBar backArrow={false}>个人中心</NavBar>

      <div className={styles["profile-page__header"]}>
        <h1 className={styles["profile-page__title"]}>
          你好，{user?.username ?? "访客"}
        </h1>
      </div>

      <div className={styles["profile-page__section"]}>
        <p className={styles["profile-page__section-title"]}>账号资料</p>
        <div className={styles["profile-page__field"]}>
          <span>用户名</span>
          <span>{user?.username ?? "-"}</span>
        </div>
        <div className={styles["profile-page__field"]}>
          <span>邮箱</span>
          <span>{user?.email ?? "-"}</span>
        </div>
        <div className={styles["profile-page__field"]}>
          <span>账号状态</span>
          <span>{user?.is_active ? "正常" : "已禁用"}</span>
        </div>
      </div>

      <List header="账号操作">
        <List.Item arrow onClick={() => setProfileVisible(true)}>
          修改资料
        </List.Item>
        <List.Item arrow onClick={() => setPasswordVisible(true)}>
          修改密码
        </List.Item>
      </List>

      <div className={styles["profile-page__actions"]}>
        <Button block color="danger" fill="outline" onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      <Popup
        visible={profileVisible}
        onMaskClick={() => setProfileVisible(false)}
        onClose={() => setProfileVisible(false)}
        bodyStyle={{
          padding: 24,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <UpdateProfileForm onDone={() => setProfileVisible(false)} />
      </Popup>

      <Popup
        visible={passwordVisible}
        onMaskClick={() => setPasswordVisible(false)}
        onClose={() => setPasswordVisible(false)}
        bodyStyle={{
          padding: 24,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <UpdatePasswordForm onDone={() => setPasswordVisible(false)} />
      </Popup>
    </div>
  );
}
