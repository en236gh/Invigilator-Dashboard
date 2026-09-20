export default function AssignmentsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading assignment review" aria-busy="true">
      <div className="h-52 animate-pulse rounded-[10px] bg-ink/15" />
      <div className="h-20 animate-pulse rounded-[10px] bg-white" />
      <div className="h-96 animate-pulse rounded-[10px] bg-white" />
    </div>
  );
}