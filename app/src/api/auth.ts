import { apiClient } from "./client";
import type { AuthResponse, User } from "../types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/register", {
      email,
      password,
      name,
    });
    return data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
