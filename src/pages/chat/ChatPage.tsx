import { useEffect, useRef, useState } from "react";
import { Button, Input, NavBar, SwipeAction } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useChatStore } from "../../store/chat";
import { showError, showSuccess } from "../../utils/toast";
import styles from "./chat.module.less";

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const {
    conversations,
    currentConversationId,
    messages,
    loading,
    streamingContent,
    streamingMessageId,
    fetchConversations,
    createConversation,
    deleteConversation,
    selectConversation,
    sendMessage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentConversationId, streamingContent]);

  const handleNewChat = async () => {
    try {
      const id = await createConversation();
      showSuccess("新建对话成功");
      selectConversation(id);
    } catch (error) {
      showError(error, "新建对话失败");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput("");
    setIsSending(true);
    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createConversation();
      }

      // 消费流式生成器
      for await (const _ of sendMessage(message, convId)) {
        // 这里什么都不用做，因为状态都在 sendMessage 内部更新了
      }

      await fetchConversations();
      if (convId) {
        await selectConversation(convId);
      }
    } catch (error) {
      showError(error, "发送消息失败");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessages = () => {
    if (!currentConversationId) return null;

    const msgs = messages[currentConversationId] || [];

    return (
      <>
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`${styles["chat-page__message"]} ${msg.role}`}
          >
            <div className={`${styles["chat-page__avatar"]} ${msg.role}`}>
              {msg.role === "user" ? "你" : "AI"}
            </div>
            <div className={styles["chat-page__message-bubble"]}>
              {msg.content}
            </div>
          </div>
        ))}
        {streamingContent && (
          <div className={`${styles["chat-page__message"]} assistant`}>
            <div className={`${styles["chat-page__avatar"]} assistant`}>AI</div>
            <div className={styles["chat-page__message-bubble"]}>
              {streamingContent}
            </div>
          </div>
        )}
        {!streamingContent && isSending && (
          <div className={`${styles["chat-page__message"]} assistant`}>
            <div className={`${styles["chat-page__avatar"]} assistant`}>AI</div>
            <div className={styles["chat-page__message-bubble"]}>
              <div className={styles["chat-page__typing-indicator"]}>
                <div className={styles["chat-page__typing-dot"]}></div>
                <div className={styles["chat-page__typing-dot"]}></div>
                <div className={styles["chat-page__typing-dot"]}></div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles["chat-page"]}>
      <div className={styles["chat-page__sidebar"]}>
        <div className={styles["chat-page__sidebar-header"]}>
          <h2 className={styles["chat-page__sidebar-title"]}>KITT AI</h2>
          <Button size="small" color="primary" onClick={handleNewChat}>
            + 新对话
          </Button>
        </div>

        <div className={styles["chat-page__sidebar-list"]}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
              加载中...
            </div>
          ) : (
            conversations.map((conv) => (
              <SwipeAction
                key={conv.id}
                rightActions={[
                  {
                    key: "delete",
                    text: "删除",
                    color: "danger",
                    onClick: async () => {
                      try {
                        await deleteConversation(conv.id);
                        showSuccess("删除成功");
                      } catch (error) {
                        showError(error, "删除失败");
                      }
                    },
                  },
                ]}
              >
                <div
                  className={`${styles["chat-page__conversation-item"]} ${currentConversationId === conv.id ? "active" : ""}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <div className={styles["chat-page__conversation-title"]}>
                    {conv.title || "新对话"}
                  </div>
                  <div className={styles["chat-page__conversation-date"]}>
                    {new Date(conv.updated_at).toLocaleString("zh-CN")}
                  </div>
                </div>
              </SwipeAction>
            ))
          )}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid #eee" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", color: "#333" }}>
                {user?.username}
              </div>
              <div style={{ color: "#888", fontSize: 12 }}>{user?.email}</div>
            </div>
            <Button size="small" onClick={() => navigate("/profile")}>
              个人中心
            </Button>
          </div>
        </div>
      </div>

      <div className={styles["chat-page__main"]}>
        <NavBar backArrow={false} className={styles["chat-page__main-header"]}>
          {currentConversationId
            ? conversations.find((c) => c.id === currentConversationId)
                ?.title || "新对话"
            : "选择对话或开始新对话"}
        </NavBar>

        <div className={styles["chat-page__messages-container"]}>
          {!currentConversationId ? (
            <div
              style={{
                textAlign: "center",
                padding: "120px 20px",
                color: "#666",
              }}
            >
              <p
                style={{
                  fontSize: 28,
                  marginBottom: 20,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                欢迎使用 KITT AI
              </p>
              <p style={{ fontSize: 16 }}>点击左侧 "+ 新对话" 开始聊天</p>
            </div>
          ) : (
            renderMessages()
          )}
          <div ref={messagesEndRef} />
        </div>

        {currentConversationId && (
          <div className={styles["chat-page__input-container"]}>
            <form
              className={styles["chat-page__input-form"]}
              onSubmit={handleSendMessage}
            >
              <Input
                className={styles["chat-page__input"]}
                placeholder="输入消息..."
                value={input}
                onChange={(v) => setInput(v)}
                disabled={isSending}
              />
              <Button
                type="submit"
                color="primary"
                disabled={!input.trim() || isSending}
                loading={isSending}
              >
                发送
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
