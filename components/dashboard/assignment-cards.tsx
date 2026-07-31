"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayIcon, StopIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExamCountdown } from "@/hooks/use-exam-countdown";
import {
  endSessionAction,
  refreshAssignmentsAction,
  startSessionAction,
} from "@/lib/actions/exam";
import { formatDate, formatTime } from "@/lib/utils";
import {
  getExamStartsAt,
  isExamClosed,
  isExamLive,
} from "@/lib/exam-time";
import type { Assignment } from "@/lib/types/api";

function statusTone(status: string) {
  if (isExamLive(status)) return "success" as const;
  if (isExamClosed(status)) return "neutral" as const;
  return "info" as const;
}

function AssignmentCard({
  assignment,
  onUpdated,
}: {
  assignment: Assignment;
  onUpdated: (next: Assignment) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const lecturer = assignment.lecturers?.[0];
  const live = isExamLive(assignment.examStatus);
  const closed = isExamClosed(assignment.examStatus);
  const scheduled = !live && !closed;
  const startsAt = getExamStartsAt(assignment);

  const syncAfterExpire = useCallback(() => {
    startTransition(async () => {
      const ended = await endSessionAction(
        assignment.examSessionId,
        assignment.venueId,
      );
      if (ended.ok && ended.data) {
        onUpdated(ended.data);
        router.refresh();
        return;
      }

      // Scheduler may already have closed it — poll until COMPLETED.
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const refreshed = await refreshAssignmentsAction();
        const match = refreshed.data?.find(
          (a) =>
            a.examSessionId === assignment.examSessionId &&
            a.venueId === assignment.venueId,
        );
        if (match) {
          onUpdated(match);
          if (isExamClosed(match.examStatus)) {
            router.refresh();
            return;
          }
        }
      }
      router.refresh();
    });
  }, [assignment.examSessionId, assignment.venueId, onUpdated, router]);

  const { label, expired } = useExamCountdown({
    assignment,
    enabled: live,
    onExpire: syncAfterExpire,
  });

  function startExam() {
    startTransition(async () => {
      const result = await startSessionAction(
        assignment.examSessionId,
        assignment.venueId,
      );
      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }
      onUpdated(result.data);
      toast.success(result.message);
      router.refresh();
    });
  }

  function endExam() {
    if (!confirmingEnd) {
      setConfirmingEnd(true);
      return;
    }
    startTransition(async () => {
      const result = await endSessionAction(
        assignment.examSessionId,
        assignment.venueId,
      );
      setConfirmingEnd(false);
      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }
      onUpdated(result.data);
      toast.success(result.message);
      router.refresh();
    });
  }

  useEffect(() => {
    if (!confirmingEnd) return;
    const id = window.setTimeout(() => setConfirmingEnd(false), 4000);
    return () => window.clearTimeout(id);
  }, [confirmingEnd]);

  return (
    <article className="rounded-[10px] border border-transparent bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">
            {assignment.courseCode}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {assignment.venueName}
            {assignment.building ? ` · ${assignment.building}` : ""}
          </p>
        </div>
        <Badge tone={statusTone(assignment.examStatus)}>
          {assignment.examStatus}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted">Date</dt>
          <dd className="font-medium text-ink">
            {formatDate(assignment.examDate)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Window</dt>
          <dd className="font-medium text-ink">
            {formatTime(assignment.startTime)} –{" "}
            {formatTime(assignment.endTime)}
          </dd>
        </div>
      </dl>

      {live ? (
        <div className="mt-4 rounded-[10px] bg-ink px-4 py-3 text-white">
          <p className="text-xs uppercase tracking-wide text-white/60">
            {expired ? "Ending…" : "Time remaining"}
          </p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums tracking-tight">
            {expired ? "00:00" : label}
          </p>
        </div>
      ) : null}

      {scheduled && startsAt ? (
        <p className="mt-4 text-sm text-muted">
          Starts at{" "}
          <span className="font-medium text-ink">
            {startsAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </p>
      ) : null}

      {closed ? (
        <p className="mt-4 text-sm text-muted">
          Session closed. Use attendance and reports.
        </p>
      ) : null}

      {lecturer ? (
        <div className="mt-4 rounded-[10px] bg-surface-muted px-3 py-2.5 text-sm">
          <p className="font-medium text-ink">{lecturer.fullName}</p>
          <p className="text-muted">
            {lecturer.email}
            {lecturer.department ? ` · ${lecturer.department}` : ""}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {scheduled ? (
          <Button type="button" onClick={startExam} disabled={pending}>
            <PlayIcon className="h-4 w-4" />
            Start exam
          </Button>
        ) : null}

        {live ? (
          <Button
            type="button"
            variant={confirmingEnd ? "danger" : "secondary"}
            onClick={endExam}
            disabled={pending || expired}
          >
            <StopIcon className="h-4 w-4" />
            {confirmingEnd ? "Confirm end" : expired ? "Ending…" : "End exam"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function AssignmentCards({
  assignments: initial,
}: {
  assignments: Assignment[];
}) {
  const [assignments, setAssignments] = useState(initial);

  useEffect(() => {
    setAssignments(initial);
  }, [initial]);

  function patchAssignment(next: Assignment) {
    setAssignments((prev) =>
      prev.map((a) =>
        a.examSessionId === next.examSessionId && a.venueId === next.venueId
          ? next
          : a,
      ),
    );
  }

  if (!assignments.length) {
    return (
      <div className="rounded-[10px] border border-dashed border-black/10 bg-white/70 p-8 text-center text-sm text-muted">
        No seeded assignments for this invigilator yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={`${assignment.examSessionId}-${assignment.venueId}`}
          assignment={assignment}
          onUpdated={patchAssignment}
        />
      ))}
    </div>
  );
}

/** Compact readout for the dashboard stats tile. */
export function ActiveSessionCountdown({
  assignment,
}: {
  assignment: Assignment | null;
}) {
  const { label, live, expired } = useExamCountdown({
    assignment,
    enabled: !!assignment && isExamLive(assignment.examStatus),
  });

  if (!assignment || !live) {
    return <span className="text-3xl font-bold text-muted md:text-4xl">—</span>;
  }

  return (
    <span className="font-mono text-4xl font-bold tracking-tight tabular-nums text-ink md:text-5xl">
      {expired ? "00:00" : label}
    </span>
  );
}
