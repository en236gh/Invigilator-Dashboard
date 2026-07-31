"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatCountdown,
  getExamEndsAt,
  remainingMs,
} from "@/lib/exam-time";
import type { Assignment } from "@/lib/types/api";

type Options = {
  assignment: Pick<Assignment, "examDate" | "endTime" | "examStatus"> | null;
  enabled?: boolean;
  onExpire?: () => void;
};

export function useExamCountdown({
  assignment,
  enabled = true,
  onExpire,
}: Options) {
  const live =
    enabled &&
    !!assignment &&
    assignment.examStatus.toUpperCase() === "IN_PROGRESS";

  const endsAtMs = live && assignment
    ? (getExamEndsAt(assignment)?.getTime() ?? null)
    : null;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const [msLeft, setMsLeft] = useState(() =>
    endsAtMs == null ? 0 : remainingMs(new Date(endsAtMs)),
  );

  useEffect(() => {
    if (endsAtMs == null) {
      setMsLeft(0);
      return;
    }

    const endsAt = new Date(endsAtMs);
    let expiredNotified = remainingMs(endsAt) === 0;

    const tick = () => {
      const next = remainingMs(endsAt);
      setMsLeft(next);
      if (next === 0 && !expiredNotified) {
        expiredNotified = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAtMs]);

  return {
    msLeft,
    label: live ? formatCountdown(msLeft) : "—",
    expired: live && msLeft === 0,
    live,
  };
}
