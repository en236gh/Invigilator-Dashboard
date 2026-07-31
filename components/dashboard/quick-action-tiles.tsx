import {
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Tile } from "@/components/ui/tile";

export function QuickActionTiles() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Quick actions</h2>
        <p className="text-sm text-muted">
          Tile shortcuts for the core invigilator workflow.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          title="Students Check-in"
          subtitle="Primary"
          href="/check-in"
          accent="green"
          icon={<QrCodeIcon className="h-6 w-6" />}
          className="min-h-[140px] bg-gradient-to-br from-white to-emerald-50/60"
        >
          <p className="pt-2 text-sm text-muted">
            Look up by computer number and verify attendance.
          </p>
        </Tile>
        <Tile
          title="Attendance register"
          href="/attendance"
          accent="ink"
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
          className="min-h-[140px]"
        >
          <p className="pt-2 text-sm text-muted">
            Review present, absent, and scripts collected.
          </p>
        </Tile>
        <Tile
          title="Report incident"
          href="/incidents"
          accent="red"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          className="min-h-[140px] bg-gradient-to-br from-white to-rose-50/50"
        >
          <p className="pt-2 text-sm text-muted">
            Log cheating, phones, medical, or venue issues.
          </p>
        </Tile>
        <Tile
          title="Generate report"
          href="/reports"
          accent="gold"
          icon={<DocumentChartBarIcon className="h-6 w-6" />}
          className="min-h-[140px] bg-gradient-to-br from-white to-amber-50/60"
        >
          <p className="pt-2 text-sm text-muted">
            Create exam-session attendance report metadata.
          </p>
        </Tile>
      </div>
    </section>
  );
}
