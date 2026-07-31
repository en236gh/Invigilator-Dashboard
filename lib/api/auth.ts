import { apiRequest } from "@/lib/api/client";
import type { LoginResponse } from "@/lib/types/api";

export async function loginRequest(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export async function refreshRequest(refreshToken: string) {
  return apiRequest<LoginResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}
