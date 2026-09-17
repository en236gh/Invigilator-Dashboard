import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TileProps = {
  title: string;
  value?: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  accent?: "default" | "gold" | "green" | "red" | "ink";
  className?: string;
  interactive?: boolean;
  children?: ReactNode;
};

const accents = {
  default: "hover:border-black/10",
  gold: "hover:border-unza-gold/40 hover:shadow-unza-gold/10",
  green: "hover:border-unza-green/30",
  red: "hover:border-unza-red/30",
  ink: "hover:border-ink/20",
};

export function Tile({
  title,
  value,
  subtitle,
  icon,
  href,
  onClick,
  accent = "default",
  className,
  interactive = true,
  children,
}: TileProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-surface-muted text-ink/70 group-hover:text-ink">
            {icon}
          </div>
        ) : (
          <span />
        )}
        {subtitle ? (
          <span className="rounded-[10px] bg-surface-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="mt-auto space-y-1 pt-6">
        <p className="text-sm font-medium text-muted">{title}</p>
        {value !== undefined ? (
          <div className="text-4xl font-bold tracking-tight text-ink tabular-nums md:text-5xl">
            {value}
          </div>
        ) : null}
        {children}
      </div>
    </>
  );

  const classes = cn(
    "group relative flex min-h-[160px] flex-col overflow-hidden rounded-[10px] border border-transparent bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-colors duration-200",
    interactive ? accents[accent] : "",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, "w-full text-left")}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
