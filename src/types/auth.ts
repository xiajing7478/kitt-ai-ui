export type SafeUser = {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
};

export type MessageResponse = {
  message: string;
};
