"use client";

import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ActiveSessionCountdown } from "@/components/dashboard/assignment-cards";
import { Tile } from "@/components/ui/tile";
import { isExamLive } from "@/lib/exam-time";
import type { Assignment, DashboardStats } from "@/lib/types/api";

export function StatsGrid({
  stats,
  assignments,
}: {
  stats: DashboardStats;
  assignments: Assignment[];
}) {
  const active =
    assignments.find((a) => isExamLive(a.examStatus)) ?? null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Tile
        title="Students Check-in"
        value={stats.checkedInStudents}
        icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
        href="/check-in"
        accent="green"
      />
      <Tile
        title="Scripts Collected"
        value={stats.scriptsCollected}
        icon={<DocumentTextIcon className="h-6 w-6" />}
        href="/attendance"
        accent="gold"
      />
      <Tile
        title="Time remaining"
        value={<ActiveSessionCountdown assignment={active} />}
        subtitle={active ? active.courseCode : undefined}
        icon={<ClockIcon className="h-6 w-6" />}
        accent="ink"
        interactive={false}
      />
      <Tile
        title="Absent Students"
        value={stats.absentStudents}
        icon={<UserGroupIcon className="h-6 w-6" />}
        href="/attendance"
        accent="red"
      />
      <Tile
        title="Assigned Examinations"
        value={stats.assignedExaminations}
        icon={<AcademicCapIcon className="h-6 w-6" />}
        accent="ink"
        interactive={false}
      />
      <Tile
        title="Assigned Venues"
        value={stats.assignedVenues}
        icon={<BuildingOffice2Icon className="h-6 w-6" />}
        accent="default"
        interactive={false}
      />
      <Tile
        title="Incidents"
        value={stats.incidents}
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        href="/incidents"
        accent="red"
      />
    </div>
  );
}
