"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Tile } from "@/components/ui/tile";
import { scriptsCollectedAction } from "@/lib/actions/exam";
import { formatTime } from "@/lib/utils";
import type {
  Assignment,
  AttendanceRecord,
  AttendanceSummary,
} from "@/lib/types/api";
import {
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";

function statusTone(status: string) {
  const value = status.toUpperCase();
  if (value === "PRESENT") return "success" as const;
  if (value === "WRONG_VENUE") return "warning" as const;
  if (value === "ABSENT") return "danger" as const;
  return "neutral" as const;
}

export function AttendanceWorkspace({
  assignments,
  initialExamSessionId,
  records,
  summary,
  query = "",
}: {
  assignments: Assignment[];
  initialExamSessionId?: number;
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  query?: string;
}) {
  const router = useRouter();
  const defaultId =
    initialExamSessionId ??
    assignments.find((a) => a.venueId === 16)?.examSessionId ??
    assignments[0]?.examSessionId;

  const [examSessionId, setExamSessionId] = useState(String(defaultId ?? ""));
  const [scriptCount, setScriptCount] = useState("0");
  const [filter, setFilter] = useState(query);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (row) =>
        row.computerNumber.toLowerCase().includes(q) ||
        row.studentName.toLowerCase().includes(q) ||
        row.attendanceStatus.toLowerCase().includes(q),
    );
  }, [filter, records]);

  function changeExam(value: string) {
    setExamSessionId(value);
    router.push(`/attendance?examSessionId=${value}`);
  }

  function submitScripts() {
    const count = Number(scriptCount);
    if (!examSessionId || Number.isNaN(count) || count < 0) {
      toast.error("Enter a valid script count.");
      return;
    }
    startTransition(async () => {
      const result = await scriptsCollectedAction(Number(examSessionId), count);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <Field label="Examination session">
          <Select
            value={examSessionId}
            onChange={(e) => changeExam(e.target.value)}
          >
            {assignments.map((a) => (
              <option
                key={`${a.examSessionId}-${a.venueId}`}
                value={a.examSessionId}
              >
                {a.courseCode} · {a.venueName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Filter register">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Name, computer number, status"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tile
          title="Present"
          value={summary?.present ?? "—"}
          icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
          accent="green"
          interactive={false}
        />
        <Tile
          title="Absent"
          value={summary?.absent ?? "—"}
          icon={<UserMinusIcon className="h-6 w-6" />}
          accent="red"
          interactive={false}
        />
        <Tile
          title="Scripts"
          value={summary?.scriptsCollected ?? "—"}
          icon={<DocumentTextIcon className="h-6 w-6" />}
          accent="gold"
          interactive={false}
        />
      </div>

      <section className="rounded-[10px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Register</h2>
            <p className="text-sm text-muted">
              {filtered.length} student{filtered.length === 1 ? "" : "s"} shown
            </p>
          </div>
          <div className="flex items-end gap-2">
            <Field label="Scripts collected" className="min-w-[140px]">
              <Input
                type="number"
                min={0}
                value={scriptCount}
                onChange={(e) => setScriptCount(e.target.value)}
              />
            </Field>
            <Button type="button" onClick={submitScripts} disabled={pending}>
              Save
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-muted">
                <th className="px-2 py-3 font-medium">Student</th>
                <th className="px-2 py-3 font-medium">Computer #</th>
                <th className="px-2 py-3 font-medium">Venue</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={`${row.computerNumber}-${row.checkInTime ?? row.attendanceStatus}`}
                  className="border-b border-black/5 transition hover:bg-surface-muted/70"
                >
                  <td className="px-2 py-3 font-medium text-ink">
                    {row.studentName}
                  </td>
                  <td className="px-2 py-3 font-mono text-ink">
                    {row.computerNumber}
                  </td>
                  <td className="px-2 py-3 text-muted">
                    {row.venueName || "—"}
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={statusTone(row.attendanceStatus)}>
                      {row.attendanceStatus}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-muted">
                    {formatTime(row.checkInTime)}
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-10 text-center text-muted"
                  >
                    No attendance rows for this exam yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
