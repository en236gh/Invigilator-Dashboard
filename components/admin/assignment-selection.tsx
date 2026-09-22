"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Select } from "@/components/ui/field";
export type AssignmentChoice = { key: string; label: string; value: string; options: { value: string; label: string }[]; enabled: boolean };
export function AssignmentSelection({ choices }: { choices: AssignmentChoice[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function choose(index: number, value: string) {
    const query = new URLSearchParams();
    choices.slice(0, index).forEach((choice) => { if (choice.value) query.set(choice.key, choice.value); });
    if (value) query.set(choices[index].key, value);
    startTransition(() => router.push(`/assignments?${query}`));
  }
  return <section aria-busy={pending} className="space-y-4 rounded-[10px] bg-white p-5 shadow-sm">
    <div><h2 className="text-lg font-semibold text-ink">Select an academic examination</h2><p className="mt-1 text-sm text-muted">Choose a school, programme, year, course, examination and venue. Shared examinations have one set of assignments.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{choices.map((choice, index) => <Field key={choice.key} label={choice.label} htmlFor={choice.key}><Select id={choice.key} value={choice.value} disabled={pending || !choice.enabled} onChange={(event) => choose(index, event.target.value)}><option value="">{choice.enabled && !choice.options.length ? `No ${choice.label.toLowerCase()} options available` : `Select ${choice.label.toLowerCase()}`}</option>{choice.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>)}</div>
    {pending && <p role="status" className="text-sm text-muted">Loading selections…</p>}
    <a href="/assignments?review=1" className="text-sm font-medium text-unza-green underline">Review existing assignments</a>
  </section>;
}
