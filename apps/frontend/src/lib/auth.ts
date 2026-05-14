import { api } from "./api";
import type { User } from "@/types";

export async function getCurrentUser() {
  const { data } = await api.get<{ user: User }>("/api/auth/me");
  return data.user;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<{ user: User; token: string }>("/api/auth/login", input);
  return data;
}

export async function signup(input: { name: string; email: string; password: string }) {
  const { data } = await api.post<{ user: User; token: string }>("/api/auth/signup", input);
  return data;
}

export async function logout() {
  await api.post("/api/auth/logout");
}
