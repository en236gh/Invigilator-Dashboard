"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { refreshSessionAction } from "@/lib/actions/auth";
import {
  ACCESS_EXPIRES_AT_COOKIE,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_SKEW_MS,
} from "@/lib/constants";

function readExpiresAt(): number | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCESS_EXPIRES_AT_COOKIE}=`));
  if (!match) return null;
  const value = Number(decodeURIComponent(match.split("=")[1] ?? ""));
  return Number.isFinite(value) ? value : null;
}

/**
 * Keeps the session alive by refreshing the access token ~1 minute before
 * the 5-minute JWT expires. Schedules the next refresh from the new expiry.
 */
export function TokenRefreshKeeper() {
  const router = useRouter();
  const inFlight = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    function clearTimer() {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function scheduleNext(expiresAt: number | null | undefined) {
      clearTimer();
      if (cancelled) return;

      const target =
        typeof expiresAt === "number" && Number.isFinite(expiresAt)
          ? expiresAt
          : Date.now() + ACCESS_TOKEN_TTL_MS;

      // Refresh 1 minute before expiry (or immediately if already in the skew window).
      const delay = Math.max(5_000, target - Date.now() - REFRESH_SKEW_MS);
      timerRef.current = window.setTimeout(() => {
        void refreshNow(true);
      }, delay);
    }

    async function refreshNow(force: boolean) {
      if (cancelled || inFlight.current) return;
      inFlight.current = true;
      try {
        const result = await refreshSessionAction(force);
        if (cancelled) return;

        if (result.ok) {
          scheduleNext(result.expiresAt);
          return;
        }

        // Only kick to login when the access token is already gone / expired.
        const expiresAt = readExpiresAt();
        if (expiresAt == null || expiresAt - Date.now() <= 0) {
          router.replace("/login");
          return;
        }

        // Transient failure while access token still valid — retry mid-window.
        scheduleNext(expiresAt);
      } finally {
        inFlight.current = false;
      }
    }

    // On mount: refresh immediately if near expiry, otherwise schedule.
    const expiresAt = readExpiresAt();
    const msLeft =
      expiresAt == null ? ACCESS_TOKEN_TTL_MS : expiresAt - Date.now();

    if (expiresAt == null || msLeft <= REFRESH_SKEW_MS) {
      void refreshNow(true);
    } else {
      scheduleNext(expiresAt);
    }

    const onFocus = () => {
      const nextExpiry = readExpiresAt();
      const left =
        nextExpiry == null ? 0 : nextExpiry - Date.now();
      if (nextExpiry == null || left <= REFRESH_SKEW_MS) {
        void refreshNow(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    // Safety net every 60s in case the scheduled timeout was missed (sleep, etc.).
    const tickId = window.setInterval(() => {
      const nextExpiry = readExpiresAt();
      const left =
        nextExpiry == null ? 0 : nextExpiry - Date.now();
      if (nextExpiry == null || left <= REFRESH_SKEW_MS) {
        void refreshNow(true);
      }
    }, 60_000);

    return () => {
      cancelled = true;
      clearTimer();
      window.clearInterval(tickId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [router]);

  return null;
}
