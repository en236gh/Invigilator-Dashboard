import { SearchBar } from "@/components/ui/search-bar";
import type { SessionUser } from "@/lib/types/api";

export function AppHeader({
  title,
  user,
}: {
  title: string;
  user: SessionUser;
}) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
        {title}
      </h1>

      <div className="flex flex-1 items-center justify-between gap-4 lg:justify-end">
        <SearchBar className="hidden sm:flex lg:mx-auto" />

        <div className="flex items-center gap-3 rounded-[10px] bg-white/70 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-unza-gold to-amber-600 text-sm font-bold text-white shadow-inner">
            {initials || "IN"}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs capitalize text-muted">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
