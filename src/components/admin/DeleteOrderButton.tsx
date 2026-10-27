"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DeleteOrderButton({
  action,
  redirectTo,
}: {
  action: () => Promise<void>;
  /** Navigate here after deleting (e.g. away from a detail page that no longer exists). Omit to just refresh the current list. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this cancelled order? This can't be undone.")) return;
    startTransition(async () => {
      await action();
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
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
