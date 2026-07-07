import { create } from "zustand";
import { apiRequest } from "../api/client";
import { AUTH_TOKEN_STORAGE_KEY } from "../api/config";

export type Message = {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
};

type ChatState = {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: Record<number, Message[]>;
  loading: boolean;
  streamingContent: string;
  streamingMessageId: number | null;

  fetchConversations: () => Promise<void>;
  fetchConversation: (id: number) => Promise<void>;
  createConversation: (title?: string) => Promise<number>;
  updateConversationTitle: (id: number, title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  selectConversation: (id: number | null) => void;
  sendMessage: (
    message: string,
    conversationId?: number,
  ) => AsyncGenerator<string, void, unknown>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: {},
  loading: false,
  streamingContent: "",
  streamingMessageId: null,

  async fetchConversations() {
    set({ loading: true });
    try {
      const conversations = await apiRequest<Conversation[]>(
        "/api/conversations",
        {
          method: "GET",
          auth: true,
        },
      );
      set({ conversations, loading: false });
    } catch (error) {
      console.error("Failed to fetch conversations", error);
      set({ loading: false });
    }
  },

  async fetchConversation(id: number) {
    set({ loading: true });
    try {
      const conversation = await apiRequest<
        Conversation & { messages: Message[] }
      >(`/api/conversations/${id}`, {
        method: "GET",
        auth: true,
      });
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversation.id ? conversation : c,
        ),
        messages: {
          ...state.messages,
          [conversation.id]: conversation.messages,
        },
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch conversation", error);
      set({ loading: false });
    }
  },

  async createConversation(title?: string) {
    const newConversation = await apiRequest<Conversation>(
      "/api/conversations",
      {
        method: "POST",
        auth: true,
        body: { title },
      },
    );
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }));
    return newConversation.id;
  },

  async updateConversationTitle(id: number, title: string) {
    const updated = await apiRequest<Conversation>(`/api/conversations/${id}`, {
      method: "PATCH",
      auth: true,
      body: { title },
    });
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? updated : c,
      ),
    }));
  },

  async deleteConversation(id: number) {
    await apiRequest(`/api/conversations/${id}`, {
      method: "DELETE",
      auth: true,
    });
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id ? null : state.currentConversationId,
    }));
  },

  selectConversation(id: number | null) {
    set({ currentConversationId: id });
    if (id) {
      get().fetchConversation(id);
    }
  },

  async *sendMessage(userMessage: string, conversationId?: number) {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const url = conversationId
      ? `/api/conversations/${conversationId}/messages`
      : "/api/chat";

    const convId = conversationId;
    const tempMessageId = Date.now();

    // 1. 先把用户消息添加到本地界面
    const userMsg: Message = {
      id: tempMessageId,
      conversation_id: convId || 0,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: {
        ...state.messages,
        ...(convId
          ? {
              [convId]: [...(state.messages[convId] || []), userMsg],
            }
          : {}),
      },
    }));

    // 2. 创建 AI 回复的临时消息
    const aiTempMessageId = tempMessageId + 1;
    set((state) => ({
      streamingMessageId: aiTempMessageId,
      streamingContent: "",
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const rawText = await response.text();
      let errorMessage = "请求失败";
      try {
        const errorData = JSON.parse(rawText) as { message?: string };
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // 如果解析 JSON 失败，使用默认提示
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) {
      throw new Error("Response body is null");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;

            try {
              const data = JSON.parse(dataStr);
              const text = data.text || "";
              if (text) {
                fullContent += text;
                set({ streamingContent: fullContent });
                yield text;
              }
            } catch {
              continue;
            }
          }
        }
      }

      // 3. 流结束后，更新为完整的消息
      if (convId && fullContent) {
        set((state) => ({
          messages: {
            ...state.messages,
            [convId]: [
              ...(state.messages[convId] || []),
              {
                id: tempMessageId,
                conversation_id: convId,
                role: "assistant",
                content: fullContent,
                created_at: new Date().toISOString(),
              },
            ],
          },
        }));
      }

      set({ streamingContent: "", streamingMessageId: null });
    } finally {
      reader.releaseLock();
    }
  },
}));
