/**
 * Vendor-agnostic error reporting. Always logs to the console; if
 * MONITORING_WEBHOOK_URL is set, also POSTs a minimal payload there.
 * Point it at a Sentry envelope endpoint, a Slack/Discord webhook, or a
 * simple logging service — swap this file for a full vendor SDK (Sentry,
 * LogRocket, etc.) if you outgrow it. Mirrors the PaymentProvider pattern
 * in this codebase: a stable interface with a pluggable backend.
 */

interface ErrorContext {
  [key: string]: unknown;
}

function webhookUrl(): string | undefined {
  return process.env.MONITORING_WEBHOOK_URL || process.env.NEXT_PUBLIC_MONITORING_WEBHOOK_URL;
}

export function reportError(error: unknown, context?: ErrorContext) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[monitoring]", message, { stack, ...context });

  const url = webhookUrl();
  if (!url) return;

  const payload = JSON.stringify({
    message,
    stack,
    context,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  });

  try {
    if (typeof window !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, payload);
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
        () => undefined
      );
    }
  } catch {
    // Never let error reporting itself throw.
  }
}

export function installClientErrorReporting() {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (event) => reportError(event.error ?? event.message, { type: "window.error" }));
  window.addEventListener("unhandledrejection", (event) => reportError(event.reason, { type: "unhandledrejection" }));
}
