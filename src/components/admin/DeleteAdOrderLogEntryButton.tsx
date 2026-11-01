"use client";

import { useTransition } from "react";

export function DeleteAdOrderLogEntryButton({ action }: { action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this logged order? This can't be undone.")) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-full border border-brand-error/40 px-2.5 py-1.5 font-body text-xs text-brand-error transition hover:bg-brand-error/10 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
