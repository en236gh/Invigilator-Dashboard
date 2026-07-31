import { cookies } from "next/headers";
import {
  ACCESS_EXPIRES_AT_COOKIE,
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_COOKIE,
  USER_EMAIL_COOKIE,
  USER_NAME_COOKIE,
} from "@/lib/constants";
import type { SessionUser } from "@/lib/types/api";

const cookieBase = {
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Read JWT `exp` (ms) without verifying — timing only. */
export function readAccessTokenExpiry(accessToken: string): number {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) throw new Error("missing payload");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      Buffer.from(normalized, "base64").toString("utf8"),
    ) as { exp?: number };
    if (typeof json.exp === "number") return json.exp * 1000;
  } catch {
    // fall through
  }
  return Date.now() + ACCESS_TOKEN_TTL_MS;
}

export async function getAccessToken() {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function getAccessExpiresAt() {
  const jar = await cookies();
  const raw = jar.get(ACCESS_EXPIRES_AT_COOKIE)?.value;
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const email = jar.get(USER_EMAIL_COOKIE)?.value;
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!email || !token) return null;

  const name =
    jar.get(USER_NAME_COOKIE)?.value ||
    email.split("@")[0]?.replace(/[._]/g, " ") ||
    "Invigilator";

  return {
    email,
    name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    role: "invigilator",
  };
}

export async function setSessionCookies(input: {
  accessToken: string;
  refreshToken?: string;
  email: string;
  name?: string;
}) {
  const jar = await cookies();
  const expiresAt = readAccessTokenExpiry(input.accessToken);
  const accessMaxAge = Math.max(
    60,
    Math.ceil((expiresAt - Date.now()) / 1000) + 30,
  );

  jar.set(ACCESS_TOKEN_COOKIE, input.accessToken, {
    ...cookieBase,
    httpOnly: true,
    maxAge: accessMaxAge,
  });

  // Client-readable clock for proactive refresh (not a secret).
  jar.set(ACCESS_EXPIRES_AT_COOKIE, String(expiresAt), {
    ...cookieBase,
    httpOnly: false,
    maxAge: accessMaxAge,
  });

  if (input.refreshToken) {
    jar.set(REFRESH_TOKEN_COOKIE, input.refreshToken, {
      ...cookieBase,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  jar.set(USER_EMAIL_COOKIE, input.email, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });

  if (input.name) {
    jar.set(USER_NAME_COOKIE, input.name, {
      ...cookieBase,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
  jar.delete(USER_EMAIL_COOKIE);
  jar.delete(USER_NAME_COOKIE);
  jar.delete(ACCESS_EXPIRES_AT_COOKIE);
}
