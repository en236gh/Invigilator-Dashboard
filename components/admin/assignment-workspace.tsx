"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  PlusIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import {
  autoAssignAction,
  cancelAssignmentAction,
  createAssignmentAction,
  publishAssignmentsAction,
} from "@/lib/actions/admin";
import type { Examination, InvigilatorAssignment, VenueStaffing } from "@/lib/types/api";

function statusTone(status?: string) {
  if (status === "FULLY_STAFFED" || status === "PUBLISHED") return "success" as const;
  if (status === "UNDERSTAFFED" || status === "DRAFT") return "warning" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "neutral" as const;
}

export function AssignmentWorkspace({
  examinations,
  selectedExam,
  staffing,
  assignments,
}: {
  examinations: Examination[];
  selectedExam: Examination;
  staffing: VenueStaffing[];
  assignments: InvigilatorAssignment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [manualOpen, setManualOpen] = useState(false);

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  const draftCount = assignments.filter((item) => item.status === "DRAFT").length;
  const publishedCount = assignments.filter((item) => item.status === "PUBLISHED").length;
  const understaffed = staffing.filter((item) => item.staffingStatus === "UNDERSTAFFED").length;

  return (
    <div className="space-y-6">
      <section className="rounded-[10px] bg-ink p-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unza-gold">Assignment control room</p>
            <h2 className="mt-2 text-2xl font-bold">Prepare invigilators before exam day</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">Generate a draft, review venue coverage, then publish only when every assignment is ready for operational use.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={pending} onClick={() => runAction(() => autoAssignAction(selectedExam.examSessionId))}>
              <SparklesIcon className="h-4 w-4" /> Auto-assign drafts
            </Button>
            <Button variant="primary" disabled={pending || draftCount === 0} onClick={() => { if (window.confirm("Publish all remaining draft assignments for this examination?")) runAction(() => publishAssignmentsAction(selectedExam.examSessionId)); }}>
              <CheckCircleIcon className="h-4 w-4" /> Publish {draftCount ? `${draftCount} drafts` : "assignments"}
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Drafts to review" value={draftCount} />
          <Metric label="Published" value={publishedCount} />
          <Metric label="Venues needing staff" value={understaffed} />
        </div>
      </section>

      <section className="rounded-[10px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Examination session</p>
            <p className="text-xs text-muted">Choose the session whose staffing you are preparing.</p>
          </div>
          <Select value={selectedExam.examSessionId} onChange={(event) => router.push(`/assignments?examSessionId=${event.target.value}`)} className="w-full md:w-80">
            {examinations.map((exam) => <option key={exam.examSessionId} value={exam.examSessionId}>{exam.courseCode} · {exam.examDate}</option>)}
          </Select>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[10px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-ink">Venue staffing</h2><p className="mt-1 text-sm text-muted">One invigilator is required for every 50 allocated students.</p></div>
            <ArrowPathIcon className="h-5 w-5 text-muted" />
          </div>
          <div className="mt-4 space-y-3">
            {staffing.map((venue) => <article key={venue.venueId} className="flex flex-col gap-3 rounded-[10px] bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-ink">{venue.venueName ?? `Venue ${venue.venueId}`}</p><p className="mt-1 text-sm text-muted">{venue.allocatedStudents ?? 0} students · {venue.requiredInvigilators ?? 0} required · {venue.draftCount ?? 0} draft · {venue.publishedCount ?? 0} published</p></div><Badge tone={statusTone(venue.staffingStatus)}>{(venue.staffingStatus ?? "UNKNOWN").replaceAll("_", " ")}</Badge></article>)}
            {!staffing.length && <p className="py-10 text-center text-sm text-muted">No venue staffing data is available for this session.</p>}
          </div>
        </section>

        <section className="rounded-[10px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-ink">Review assignments</h2><p className="mt-1 text-sm text-muted">Draft changes remain private until published.</p></div><Button size="sm" variant="secondary" onClick={() => setManualOpen(true)}><PlusIcon className="h-4 w-4" /> Manual draft</Button></div>
          <div className="mt-4 space-y-2">
            {assignments.map((assignment) => <article key={`${assignment.venueId}-${assignment.staffId}`} className="flex items-center justify-between gap-3 rounded-[10px] border border-black/5 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{assignment.staffName ?? `Staff #${assignment.staffId}`}</p><p className="truncate text-xs text-muted">{assignment.venueName ?? `Venue #${assignment.venueId}`} · {assignment.notes || "No notes"}</p></div><div className="flex shrink-0 items-center gap-2"><Badge tone={statusTone(assignment.status)}>{assignment.status}</Badge>{assignment.status !== "CANCELLED" && <button type="button" aria-label="Cancel assignment" title="Cancel assignment" disabled={pending} onClick={() => runAction(() => cancelAssignmentAction({ examSessionId: selectedExam.examSessionId, venueId: assignment.venueId, staffId: assignment.staffId }))} className="rounded p-1.5 text-muted transition hover:bg-unza-red/10 hover:text-unza-red"><XMarkIcon className="h-4 w-4" /></button>}</div></article>)}
            {!assignments.length && <p className="py-10 text-center text-sm text-muted">No assignments yet. Generate a draft to begin the review.</p>}
          </div>
        </section>
      </div>

      {manualOpen && <ManualAssignmentModal examSessionId={selectedExam.examSessionId} staffing={staffing} pending={pending} onClose={() => setManualOpen(false)} onSubmit={(input) => runAction(async () => { const result = await createAssignmentAction(input); if (result.ok) setManualOpen(false); return result; })} />}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-[10px] bg-white/10 px-4 py-3"><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }

function ManualAssignmentModal({ examSessionId, staffing, pending, onClose, onSubmit }: { examSessionId: number; staffing: VenueStaffing[]; pending: boolean; onClose: () => void; onSubmit: (input: { examSessionId: number; venueId: number; staffId: number; notes?: string }) => void }) {
  const [venueId, setVenueId] = useState(staffing[0]?.venueId?.toString() ?? "");
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby="manual-assignment-title"><div className="w-full max-w-lg rounded-[10px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="manual-assignment-title" className="text-xl font-bold text-ink">Add manual draft</h2><p className="mt-1 text-sm text-muted">Use this for a reviewed exception or a targeted venue change.</p></div><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded p-1 text-muted hover:bg-surface-muted"><XMarkIcon className="h-5 w-5" /></button></div><form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ examSessionId, venueId: Number(form.get("venueId")), staffId: Number(form.get("staffId")), notes: String(form.get("notes") || "") }); }}><Field label="Venue"><Select name="venueId" value={venueId} onChange={(event) => setVenueId(event.target.value)} required>{staffing.map((venue) => <option key={venue.venueId} value={venue.venueId}>{venue.venueName ?? `Venue ${venue.venueId}`}</option>)}</Select></Field><Field label="Staff ID"><Input name="staffId" type="number" min="1" required placeholder="Enter the eligible invigilator ID" /></Field><Field label="Notes"><Input name="notes" placeholder="Why this assignment was reviewed" /></Field><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={pending}>Create draft</Button></div></form></div></div>;
}