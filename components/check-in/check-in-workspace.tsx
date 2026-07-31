"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/field";
import { useExamCountdown } from "@/hooks/use-exam-countdown";
import {
  checkInAction,
  endSessionAction,
  lookupStudentAction,
  refreshAssignmentsAction,
} from "@/lib/actions/exam";
import {
  canCheckIn,
  isExamClosed,
  isExamLive,
} from "@/lib/exam-time";
import type { Assignment, StudentLookup } from "@/lib/types/api";

export function CheckInWorkspace({
  assignments: initialAssignments,
  initialComputerNumber = "",
}: {
  assignments: Assignment[];
  initialComputerNumber?: string;
}) {
  const router = useRouter();
  const [assignments, setAssignments] = useState(initialAssignments);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const preferred =
    assignments.find((a) => isExamLive(a.examStatus)) ??
    assignments.find((a) => a.venueId === 16) ??
    assignments[0] ??
    null;

  const [selection, setSelection] = useState(
    preferred ? `${preferred.examSessionId}:${preferred.venueId}` : "",
  );
  const [computerNumber, setComputerNumber] = useState(initialComputerNumber);
  const [student, setStudent] = useState<StudentLookup | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(() => {
    const [examSessionId, venueId] = selection.split(":").map(Number);
    return (
      assignments.find(
        (a) => a.examSessionId === examSessionId && a.venueId === venueId,
      ) ?? null
    );
  }, [assignments, selection]);

  const syncAfterExpire = useCallback(() => {
    if (!selected) return;
    startTransition(async () => {
      await endSessionAction(selected.examSessionId, selected.venueId);
      const refreshed = await refreshAssignmentsAction();
      if (refreshed.ok && refreshed.data) {
        setAssignments(refreshed.data);
      }
      router.refresh();
    });
  }, [selected, router]);

  const { live, expired, label } = useExamCountdown({
    assignment: selected,
    enabled: !!selected && isExamLive(selected.examStatus),
    onExpire: syncAfterExpire,
  });

  const checkInAllowed =
    !!selected && canCheckIn(selected.examStatus) && !expired;

  function onLookup() {
    if (!selected) {
      toast.error("Select an assignment first.");
      return;
    }
    if (!checkInAllowed) {
      toast.error(
        isExamClosed(selected.examStatus)
          ? "This exam has ended. Check-in is closed."
          : expired
            ? "Exam time is up. Check-in is locked."
            : "Start this exam from the dashboard first.",
      );
      return;
    }
    if (!computerNumber.trim()) {
      toast.error("Enter a computer number.");
      return;
    }

    startTransition(async () => {
      const result = await lookupStudentAction(
        computerNumber,
        selected.examSessionId,
      );
      if (!result.ok || !result.data) {
        setStudent(null);
        toast.error(result.message);
        return;
      }
      setStudent(result.data);
      toast.success("Student loaded for verification.");
    });
  }

  function onCheckIn() {
    if (!selected || !student || !checkInAllowed) return;
    startTransition(async () => {
      const result = await checkInAction({
        computerNumber: student.computerNumber,
        examSessionId: selected.examSessionId,
        venueId: selected.venueId,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setStudent({ ...student, alreadyCheckedIn: true });
    });
  }

  if (!assignments.length) {
    return (
      <div className="rounded-[10px] bg-white p-8 text-center text-muted shadow-sm">
        No assignments available. Contact exam administration.
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-5 rounded-[10px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-lg font-semibold text-ink">Check-in</h2>
          <p className="text-sm text-muted">
            Sessions are started from the dashboard. Only in-progress exams
            accept check-ins.
          </p>
        </div>

        {selected && live ? (
          <div className="flex items-center justify-between rounded-[10px] bg-ink px-4 py-3 text-white">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">
                {expired ? "Exam ending" : "Time remaining"}
              </p>
              <p className="font-medium">{selected.courseCode}</p>
            </div>
            <p className="font-mono text-2xl font-bold tabular-nums">
              {expired ? "00:00" : label}
            </p>
          </div>
        ) : null}

        {selected && !checkInAllowed ? (
          <div className="rounded-[10px] bg-surface-muted px-4 py-3 text-sm text-muted">
            {isExamClosed(selected.examStatus)
              ? "This session is completed. Use the attendance register or reports."
              : expired
                ? "Time is up — waiting for the server to close the session."
                : "This exam is not in progress. Open Dashboard → Start exam, then return here."}
          </div>
        ) : null}

        <Field label="Exam + venue">
          <Select
            value={selection}
            onChange={(e) => {
              setSelection(e.target.value);
              setStudent(null);
            }}
          >
            {assignments.map((a) => (
              <option
                key={`${a.examSessionId}-${a.venueId}`}
                value={`${a.examSessionId}:${a.venueId}`}
              >
                {a.courseCode} · {a.venueName} ({a.examStatus})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Computer number" htmlFor="computerNumber">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="computerNumber"
              value={computerNumber}
              onChange={(e) => setComputerNumber(e.target.value)}
              placeholder="e.g. 2022004264"
              className="font-mono"
              disabled={!checkInAllowed}
            />
            <Button
              type="button"
              onClick={onLookup}
              disabled={pending || !checkInAllowed}
            >
              Verify
            </Button>
          </div>
        </Field>

        {selected ? (
          <div className="rounded-[10px] bg-surface-muted p-4 text-sm">
            <p className="font-medium text-ink">
              {selected.courseCode} · {selected.venueName}
            </p>
            <p className="text-muted">
              {formatTimeWindow(selected)} · {selected.examStatus}
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[10px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        {!student ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[10px] bg-surface-muted text-muted">
              <UserIcon className="h-8 w-8" />
            </div>
            <p className="font-medium text-ink">Student preview</p>
            <p className="mt-1 max-w-xs text-sm text-muted">
              Lookup results appear here for visual verification before check-in.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-600 text-2xl font-bold text-white">
                {student.fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </div>
              <Badge tone={student.alreadyCheckedIn ? "warning" : "success"}>
                {student.alreadyCheckedIn ? "Already checked in" : "Ready"}
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <h3 className="text-2xl font-bold tracking-tight text-ink">
                {student.fullName}
              </h3>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Computer number</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {student.computerNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Programme</dt>
                  <dd className="font-medium text-ink">{student.program}</dd>
                </div>
                <div>
                  <dt className="text-muted">Allocated venue</dt>
                  <dd className="font-medium text-ink">
                    {student.allocatedVenueName}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Seat</dt>
                  <dd className="font-medium text-ink">
                    {student.seatNumber || "—"}
                  </dd>
                </div>
              </dl>

              {selected && student.allocatedVenueId !== selected.venueId ? (
                <div className="flex items-start gap-2 rounded-[10px] bg-unza-gold/10 px-3 py-2 text-sm text-amber-900">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  Checking in at a different venue will mark WRONG_VENUE.
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-6">
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={onCheckIn}
                disabled={
                  pending || student.alreadyCheckedIn || !checkInAllowed
                }
              >
                <CheckCircleIcon className="h-5 w-5" />
                Confirm check-in
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function formatTimeWindow(assignment: Assignment) {
  const start = assignment.startTime?.slice(0, 5) ?? "—";
  const end = assignment.endTime?.slice(0, 5) ?? "—";
  return `${start} – ${end}`;
}
