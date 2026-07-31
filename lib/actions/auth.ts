"use server";

import { redirect } from "next/navigation";
import { loginRequest, refreshRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  clearSessionCookies,
  getAccessExpiresAt,
  getRefreshToken,
  getSessionUser,
  setSessionCookies,
} from "@/lib/auth/session";
import { REFRESH_SKEW_MS } from "@/lib/constants";

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Invigilator";
  return local
    .replace(/[._0-9]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const data = await loginRequest(email, password);
    await setSessionCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      email,
      name: displayNameFromEmail(email),
    });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Unable to sign in. Check credentials and API availability.";
    return { error: message };
  }

  const next = String(formData.get("next") ?? "").trim();
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookies();
  redirect("/login");
}

/**
 * Refresh the access token using the stored refresh token.
 * Safe to call often — skips if still more than REFRESH_SKEW_MS from expiry
 * unless `force` is true.
 */
export async function refreshSessionAction(
  force = false,
): Promise<{ ok: boolean; expiresAt?: number; message?: string }> {
  const expiresAt = await getAccessExpiresAt();
  const msLeft = expiresAt == null ? 0 : expiresAt - Date.now();

  if (!force && expiresAt != null && msLeft > REFRESH_SKEW_MS) {
    return { ok: true, expiresAt };
  }

  const refreshToken = await getRefreshToken();
  const user = await getSessionUser();

  if (!refreshToken || !user) {
    // Only clear when we truly cannot continue.
    if (expiresAt == null || msLeft <= 0) {
      await clearSessionCookies();
    }
    return { ok: false, message: "Session expired." };
  }

  try {
    const data = await refreshRequest(refreshToken);
    if (!data.accessToken) {
      return {
        ok: false,
        expiresAt: expiresAt ?? undefined,
        message: "Refresh response missing access token.",
      };
    }
    await setSessionCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
      email: user.email,
      name: user.name,
    });
    const nextExpiry = await getAccessExpiresAt();
    return { ok: true, expiresAt: nextExpiry ?? undefined };
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;
    // Hard auth failure → clear. Transient/network → keep cookies if access still valid.
    if (status === 400 || status === 401 || status === 403 || msLeft <= 0) {
      await clearSessionCookies();
    }
    return {
      ok: false,
      expiresAt: expiresAt ?? undefined,
      message:
        error instanceof ApiError
          ? error.message
          : "Could not refresh session.",
    };
  }
}
