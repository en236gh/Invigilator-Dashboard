"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import {
  autoAssignAction,
  cancelAssignmentAction,
  createAssignmentAction,
  publishAssignmentsAction,
} from "@/lib/actions/admin";
import type { AcademicSelection, Examination, ExamVenue, VenueStaffing } from "@/lib/types/api";

function normalized(value: string) {
  return value.trim().toUpperCase();
}

function statusTone(status: string) {
  return normalized(status) === "STAFFED" ? "success" as const : "warning" as const;
}

export function AssignmentReviewWorkspace({
  selectedVenueId,
  selection,
  venues,
  examinations,
  selectedExam,
  staffing,
  error,
}: {
  selectedVenueId?: number;
  selection?: AcademicSelection;
  venues: ExamVenue[];
  examinations: Examination[];
  selectedExam: Examination;
  staffing: VenueStaffing[];
  error?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const totals = staffing[0];
  const staffedVenues = staffing.filter((venue) => normalized(venue.staffingStatus) === "STAFFED").length;
  const understaffedVenues = staffing.length - staffedVenues;
  const totalStudents = staffing.reduce((sum, venue) => sum + venue.allocatedStudentCount, 0);
  const totalRequired = staffing.reduce((sum, venue) => sum + venue.requiredInvigilatorCount, 0);

  function runAction(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  function publish() {
    if (window.confirm("Publish all approved assignments for this examination? Only published assignments become operational for invigilators.")) {
      runAction(() => publishAssignmentsAction(selectedExam.examSessionId));
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[10px] bg-ink p-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-unza-gold">Assignment review</p>
            <h2 className="mt-2 text-2xl font-bold">Review venue staffing</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70">Generate drafts, resolve venue gaps, and publish only after every assignment has been checked.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={pending || !selection || !!error} onClick={() => { if (selection) runAction(() => autoAssignAction(selectedExam.examSessionId, selection)); }}>
              <SparklesIcon className="h-4 w-4" /> {pending ? "Working..." : "Generate automatic drafts"}
            </Button>
            <Button variant="primary" disabled={pending || !staffing.length} onClick={publish}>
              <CheckCircleIcon className="h-4 w-4" /> {pending ? "Working..." : "Publish assignments"}
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Active invigilators" value={totals?.totalActiveInvigilatorCount ?? 0} />
          <Metric label="Currently assigned" value={totals?.totalAssignedInvigilatorCount ?? 0} />
          <Metric label="Remaining eligible" value={totals?.totalRemainingInvigilatorCount ?? 0} />
          <Metric label="Venues" value={staffing.length} />
        </div>
      </section>

      {!selection && <section className="rounded-[10px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><p className="text-sm font-semibold text-ink">Examination session</p><p className="text-xs text-muted">Choose the session whose staffing you are reviewing.</p></div>
          <Select value={selectedExam.examSessionId} onChange={(event) => router.push(`/assignments?examSessionId=${event.target.value}`)} className="w-full md:w-80">
            {examinations.map((exam) => <option key={exam.examSessionId} value={exam.examSessionId}>{exam.courseCode} · {exam.examDate}</option>)}
          </Select>
        </div>
      </section>}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric label="Students allocated" value={totalStudents} />
        <SummaryMetric label="Required positions" value={totalRequired} />
        <SummaryMetric label="Staffed venues" value={staffedVenues} tone="success" />
        <SummaryMetric label="Understaffed venues" value={understaffedVenues} tone={understaffedVenues ? "warning" : "success"} />
      </section>

      {error && <div className="flex items-start gap-3 rounded-[10px] border border-unza-red/20 bg-unza-red/5 p-4 text-sm text-unza-red"><ExclamationTriangleIcon className="h-5 w-5 shrink-0" /><p>{error}</p></div>}
      {!error && !staffing.length && <div className="rounded-[10px] bg-white p-12 text-center shadow-sm"><p className="font-semibold text-ink">No venue staffing data</p><p className="mt-1 text-sm text-muted">There are no venues configured for this examination session.</p></div>}

      {selection && !selectedVenueId && <p className="text-sm text-muted">Select a venue to review and manually assign its invigilators. Automatic drafts cover the whole examination.</p>}
      <div className="space-y-5">
        {staffing.filter((venue) => !selection || venue.venueId === selectedVenueId).map((venue) => (
          <VenueCard key={venue.venueId} venue={venue} pending={pending} canAssign={!!selection && !error && venues.some((item) => item.venueId === venue.venueId)} onAssign={(staffId) => { if (selection) runAction(() => createAssignmentAction({ selection, examSessionId: selectedExam.examSessionId, venueId: venue.venueId, staffId, notes: "Manually assigned by administrator" })); }} onCancel={(staffId) => runAction(() => cancelAssignmentAction({ examSessionId: selectedExam.examSessionId, venueId: venue.venueId, staffId }))} />
        ))}
      </div>
    </div>
  );
}

function VenueCard({ venue, pending, canAssign, onAssign, onCancel }: { canAssign: boolean; venue: VenueStaffing; pending: boolean; onAssign: (staffId: number) => void; onCancel: (staffId: number) => void }) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <header className="flex flex-col gap-4 border-b border-black/5 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Venue</p><h2 className="mt-1 text-xl font-bold text-ink">{venue.venueName ?? `Venue ${venue.venueId}`}</h2><p className="mt-1 text-sm text-muted">Venue ID {venue.venueId}</p></div>
        <Badge tone={statusTone(venue.staffingStatus)}>{normalized(venue.staffingStatus)}</Badge>
      </header>
      <div className="grid gap-3 border-b border-black/5 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Detail label="Students" value={venue.allocatedStudentCount} />
        <Detail label="Required" value={venue.requiredInvigilatorCount} />
        <Detail label="Assigned" value={venue.assignedInvigilatorCount} />
        <Detail label="Draft" value={venue.draftInvigilatorCount} />
        <Detail label="Published" value={venue.publishedInvigilatorCount} />
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <PersonList title="Assigned invigilators" empty="No invigilators assigned yet." people={venue.assignedInvigilators} onCancel={onCancel} pending={pending} />
        <div>
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-ink">Remaining eligible invigilators</h3><span className="text-xs text-muted">{venue.remainingInvigilators.length} available</span></div>
          <div className="mt-3 space-y-2">
            {venue.remainingInvigilators.map((person) => <div key={person.staffId} className="flex items-center justify-between gap-3 rounded-[10px] border border-black/5 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{person.staffName}</p><p className="text-xs text-muted">Staff ID {person.staffId}</p></div><Button size="sm" variant="secondary" disabled={pending || !canAssign} onClick={() => onAssign(person.staffId)}><UserPlusIcon className="h-4 w-4" /> Assign</Button></div>)}
            {!venue.remainingInvigilators.length && <p className="rounded-[10px] bg-surface-muted p-4 text-sm text-muted">No eligible invigilators remain for this venue.</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

function PersonList({ title, empty, people, onCancel, pending }: { title: string; empty: string; people: VenueStaffing["assignedInvigilators"]; onCancel: (staffId: number) => void; pending: boolean }) {
  return <div><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-ink">{title}</h3><span className="text-xs text-muted">{people.length} assigned</span></div><div className="mt-3 space-y-2">{people.map((person) => <div key={person.staffId} className="flex items-center justify-between gap-3 rounded-[10px] border border-black/5 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{person.staffName}</p><p className="text-xs text-muted">Staff ID {person.staffId}</p></div><div className="flex shrink-0 items-center gap-2"><Badge tone={normalized(person.assignmentStatus) === "PUBLISHED" ? "success" : "warning"}>{normalized(person.assignmentStatus)}</Badge><button type="button" aria-label={`Cancel ${person.staffName} assignment`} title="Cancel assignment" disabled={pending} onClick={() => onCancel(person.staffId)} className="rounded p-1.5 text-muted hover:bg-unza-red/10 hover:text-unza-red"><XMarkIcon className="h-4 w-4" /></button></div></div>)}{!people.length && <p className="rounded-[10px] bg-surface-muted p-4 text-sm text-muted">{empty}</p>}</div></div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-[10px] bg-white/10 px-4 py-3"><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>; }
function SummaryMetric({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "neutral" | "success" | "warning" }) { return <div className="rounded-[10px] bg-white p-4 shadow-sm"><p className="text-xs font-medium text-muted">{label}</p><p className={`mt-1 text-2xl font-bold ${tone === "warning" ? "text-amber-700" : tone === "success" ? "text-unza-green" : "text-ink"}`}>{value}</p></div>; }
function Detail({ label, value }: { label: string; value: number }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold text-ink">{value}</p></div>; }
