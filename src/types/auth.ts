export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type RegisterDTO = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type ForgotPasswordDTO = {
  email: string;
};

export type ResetPasswordDTO = {
  token: string;
  password: string;
};

export type AuthResponse = {
  ok: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    customer: User;
  };
  message?: string;
  code?: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
};