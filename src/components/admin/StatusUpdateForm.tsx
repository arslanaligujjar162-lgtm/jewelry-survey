"use client";

import { useRef, useTransition } from "react";

export function StatusUpdateForm({
  action,
  currentStatus,
  options,
}: {
  action: (formData: FormData) => Promise<void>;
  currentStatus: string;
  options: readonly string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => startTransition(() => action(formData))}
      className="inline-flex items-center gap-2"
    >
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        disabled={isPending}
        className="rounded-lg border border-brand-umber/20 bg-brand-ivory px-2.5 py-1.5 font-body text-xs capitalize text-brand-charcoal disabled:opacity-50"
      >
        {options.map((status) => (
          <option key={status} value={status} className="capitalize">
            {status}
          </option>
        ))}
      </select>
      {isPending && <span className="font-body text-xs text-brand-charcoal/50">Saving…</span>}
    </form>
  );
}
