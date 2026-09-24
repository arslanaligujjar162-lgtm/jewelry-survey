import type { Order } from "@/lib/types";
import { SITE_URL } from "@/lib/site-url";
import { orderSummaryText, ownerConfirmLink } from "@/lib/whatsapp";
import { formatPKR } from "@/lib/format";
import { reportError } from "@/lib/monitoring";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Emails the store owner about a new order via Resend. Inactive until
 * RESEND_API_KEY and ORDER_ALERT_EMAIL are set. Resend's shared
 * onboarding@resend.dev sender can only deliver to the address the Resend
 * account was created with, which suits an owner alert until a domain is
 * verified. Never throws: a failed alert must not fail the order.
 */
export async function notifyNewOrder(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!apiKey || !to) return;

  const adminUrl = `${SITE_URL}/admin/orders/${order.id}`;
  const whatsapp = ownerConfirmLink(order);
  const summary = orderSummaryText(order);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ORDER_ALERT_FROM ?? "1720 Orders <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        subject: `New order ${order.order_number} — ${formatPKR(order.total)}`,
        text: `${summary}\n\nConfirm with the customer on WhatsApp: ${whatsapp}\nOpen in admin: ${adminUrl}`,
        html: `<pre style="font:14px/1.5 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${escapeHtml(summary)}</pre>
<p><a href="${escapeHtml(whatsapp)}">Confirm with the customer on WhatsApp</a> · <a href="${escapeHtml(adminUrl)}">Open in admin</a></p>`,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  } catch (err) {
    reportError(err, { context: "order-alert-email", order_number: order.order_number });
  }
}
