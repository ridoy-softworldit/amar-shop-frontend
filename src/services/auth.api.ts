import { LoginDTO, RegisterDTO, ForgotPasswordDTO, ResetPasswordDTO, AuthResponse } from "@/types/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api/v1";

export const authApi = {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/customers/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/customers/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async forgotPassword(data: ForgotPasswordDTO): Promise<{ ok: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}/customers/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async resetPassword(data: ResetPasswordDTO): Promise<{ ok: boolean; message?: string }> {
    const response = await fetch(`${API_BASE}/customers/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_BASE}/customers/profile`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });
    return response.json();
  },
};