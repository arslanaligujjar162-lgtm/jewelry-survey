"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, boundary: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#FBF7EE] px-4 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[#3E2716]">Something went wrong on our end.</h1>
        <p className="mt-3 max-w-md text-sm text-[#231F1C]/80">
          Not fast, not fun — just a technical hiccup. Try again, or WhatsApp us if it keeps happening.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[#5C3A21] px-7 py-3 text-sm font-semibold text-[#FBF7EE]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
