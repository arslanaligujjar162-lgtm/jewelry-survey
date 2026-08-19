"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "1720_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-umber/15 bg-brand-umber-dark px-4 py-4 text-brand-ivory sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-xl sm:px-5 sm:shadow-lg">
      <p className="font-body text-sm">
        We use cookies to keep the site working well and understand what&apos;s useful. See our{" "}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={accept}
          className="rounded-full bg-brand-butter px-4 py-1.5 text-sm font-medium text-brand-umber-dark"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
