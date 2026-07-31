"use client";

import { MagnifyingGlassIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    if (/^\d{6,}$/.test(value)) {
      router.push(`/check-in?computerNumber=${encodeURIComponent(value)}`);
      return;
    }
    router.push(`/attendance?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex h-12 w-full max-w-md items-center gap-3 rounded-[10px] bg-surface-muted px-4 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-ink/5",
        className,
      )}
    >
      <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-muted" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        aria-label="Search"
      />
      <button
        type="button"
        className="rounded-[10px] p-1 text-muted transition hover:bg-black/5 hover:text-ink"
        aria-label="Voice search"
      >
        <MicrophoneIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
