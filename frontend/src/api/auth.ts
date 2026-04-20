import { apiFetch } from "./client";
import type { AuthResponse, User } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { username: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  registerWithInvite: (payload: { token: string; username: string; email: string; password: string; characterName: string; characterEmoji: string }) =>
    apiFetch<AuthResponse>("/api/auth/register/invite", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch<{ user: User }>("/api/auth/me"),
};
