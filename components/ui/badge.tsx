import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface-muted text-muted",
    success: "bg-unza-green/10 text-unza-green",
    warning: "bg-unza-gold/15 text-amber-800",
    danger: "bg-unza-red/10 text-unza-red",
    info: "bg-slate-900/5 text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
