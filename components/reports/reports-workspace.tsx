"use client";

import { useState, useTransition } from "react";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Tile } from "@/components/ui/tile";
import { generateReportAction } from "@/lib/actions/exam";
import type { Assignment, ReportResult } from "@/lib/types/api";

export function ReportsWorkspace({ assignments }: { assignments: Assignment[] }) {
  const preferred =
    assignments.find((a) => a.venueId === 16) ?? assignments[0] ?? null;
  const [examSessionId, setExamSessionId] = useState(
    String(preferred?.examSessionId ?? ""),
  );
  const [lastReport, setLastReport] = useState<ReportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onGenerate() {
    if (!examSessionId) {
      toast.error("Select an examination session.");
      return;
    }
    startTransition(async () => {
      const result = await generateReportAction(Number(examSessionId));
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setLastReport(result.data ?? null);
      toast.success(result.message);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="space-y-5 rounded-[10px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-lg font-semibold text-ink">Generate report</h2>
          <p className="text-sm text-muted">
            Creates attendance report metadata for an assigned exam. PDF download
            is not exposed in this phase.
          </p>
        </div>

        <Field label="Examination session">
          <Select
            value={examSessionId}
            onChange={(e) => setExamSessionId(e.target.value)}
          >
            {assignments.map((a) => (
              <option
                key={`${a.examSessionId}-${a.venueId}`}
                value={a.examSessionId}
              >
                {a.courseCode} · Session {a.examSessionId} · {a.venueName}
              </option>
            ))}
          </Select>
        </Field>

        <Button
          type="button"
          size="lg"
          onClick={onGenerate}
          disabled={pending || !assignments.length}
          className="w-full sm:w-auto"
        >
          <DocumentChartBarIcon className="h-5 w-5" />
          Generate exam report
        </Button>
      </section>

      <Tile
        title="Last generated report"
        icon={<DocumentChartBarIcon className="h-6 w-6" />}
        accent="gold"
        interactive={false}
        className="min-h-[220px]"
      >
        {lastReport ? (
          <dl className="mt-4 space-y-2 text-sm">
            {Object.entries(lastReport).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <dt className="capitalize text-muted">
                  {key.replace(/([A-Z])/g, " $1")}
                </dt>
                <dd className="font-medium text-ink">
                  {value === null || value === undefined
                    ? "—"
                    : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="pt-3 text-sm text-muted">
            Report details will appear here after generation.
          </p>
        )}
      </Tile>
    </div>
  );
}
