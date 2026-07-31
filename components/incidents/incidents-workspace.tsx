"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { reportIncidentAction } from "@/lib/actions/exam";
import { INCIDENT_SEVERITIES, INCIDENT_TYPES } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import type {
  Assignment,
  Incident,
  IncidentSeverity,
  IncidentType,
} from "@/lib/types/api";

function severityTone(severity: string) {
  if (severity === "CRITICAL") return "danger" as const;
  if (severity === "MAJOR") return "warning" as const;
  return "neutral" as const;
}

export function IncidentsWorkspace({
  assignments,
  incidents,
}: {
  assignments: Assignment[];
  incidents: Incident[];
}) {
  const preferred =
    assignments.find((a) => a.venueId === 16) ?? assignments[0] ?? null;
  const [selection, setSelection] = useState(
    preferred ? `${preferred.examSessionId}:${preferred.venueId}` : "",
  );
  const [computerNumber, setComputerNumber] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>("PHONE_FOUND");
  const [severity, setSeverity] = useState<IncidentSeverity>("MAJOR");
  const [description, setDescription] = useState("");
  const [evidencePath, setEvidencePath] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const [examSessionId, venueId] = selection.split(":").map(Number);
    if (!examSessionId || !venueId) {
      toast.error("Select an assignment.");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required.");
      return;
    }

    startTransition(async () => {
      const result = await reportIncidentAction({
        examSessionId,
        venueId,
        computerNumber: computerNumber.trim() || undefined,
        incidentType,
        severity,
        description,
        evidencePath: evidencePath.trim() || undefined,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDescription("");
      setEvidencePath("");
      setComputerNumber("");
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[10px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
      >
        <div>
          <h2 className="text-lg font-semibold text-ink">Report incident</h2>
          <p className="text-sm text-muted">
            Only exams and venues assigned to you are available.
          </p>
        </div>

        <Field label="Exam + venue">
          <Select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            required
          >
            {assignments.map((a) => (
              <option
                key={`${a.examSessionId}-${a.venueId}`}
                value={`${a.examSessionId}:${a.venueId}`}
              >
                {a.courseCode} · {a.venueName}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Incident type">
            <Select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as IncidentType)}
            >
              {INCIDENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Severity">
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
            >
              {INCIDENT_SEVERITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Computer number (optional)">
          <Input
            value={computerNumber}
            onChange={(e) => setComputerNumber(e.target.value)}
            placeholder="Optional"
            className="font-mono"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened?"
            required
          />
        </Field>

        <Field label="Evidence path (optional)">
          <Input
            value={evidencePath}
            onChange={(e) => setEvidencePath(e.target.value)}
            placeholder="/evidence/..."
          />
        </Field>

        <Button type="submit" className="w-full" disabled={pending}>
          Submit incident
        </Button>
      </form>

      <section className="rounded-[10px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-ink">Recent incidents</h2>
        <p className="mb-4 text-sm text-muted">
          Scoped to your assigned examinations.
        </p>

        <div className="space-y-3">
          {incidents.map((incident) => (
            <article
              key={incident.incidentId}
              className="rounded-[10px] border border-black/5 bg-surface-muted/50 p-4 transition hover:bg-surface-muted"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">
                  {incident.incidentType.replaceAll("_", " ")}
                </p>
                <Badge tone={severityTone(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-ink/80">{incident.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                {incident.courseCode ? <span>{incident.courseCode}</span> : null}
                {incident.venueName ? <span>{incident.venueName}</span> : null}
                {incident.computerNumber ? (
                  <span className="font-mono">{incident.computerNumber}</span>
                ) : null}
                {incident.reportedAt ? (
                  <span>
                    {formatDate(incident.reportedAt)}{" "}
                    {formatTime(incident.reportedAt)}
                  </span>
                ) : null}
              </div>
            </article>
          ))}

          {!incidents.length ? (
            <div className="rounded-[10px] border border-dashed border-black/10 px-4 py-10 text-center text-sm text-muted">
              No incidents reported yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
