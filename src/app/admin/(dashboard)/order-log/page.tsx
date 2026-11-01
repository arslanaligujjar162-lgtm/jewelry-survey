import Link from "next/link";
import { listAdOrderLog } from "@/lib/admin/queries";
import { updateAdOrderLogStatusAction, deleteAdOrderLogEntryAction } from "@/lib/admin/actions";
import { summarizeOrderLog } from "@/lib/pricing-math";
import { AdOrderLogForm } from "@/components/admin/AdOrderLogForm";
import { AdOrderLogCashInput } from "@/components/admin/AdOrderLogCashInput";
import { DeleteAdOrderLogEntryButton } from "@/components/admin/DeleteAdOrderLogEntryButton";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { formatPKR, formatDate } from "@/lib/format";
import type { AdOrderLogStatus } from "@/lib/types";

const STATUSES: AdOrderLogStatus[] = ["placed", "cancelled", "shipped", "delivered", "rto"];

const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  instagram_dm: "Instagram DM",
  other: "Other",
};

export default async function AdminOrderLogPage() {
  const entries = await listAdOrderLog();
  const summary = summarizeOrderLog(
    entries.map((e) => ({ status: e.status, revenue: e.revenue, cashCollected: e.cash_collected })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Order log</h1>
        <p className="mt-1 font-body text-sm text-brand-charcoal/60">
          One row per order, however it came in. This is where your real RTO rate (r) and cancellation rate (k) come
          from — not a guess. See the{" "}
          <Link href="/admin/pricing" className="text-brand-umber underline">
            readiness panel
          </Link>{" "}
          for what else is still blocking a campaign.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Placed" value={String(summary.totalPlaced)} />
        <SummaryStat label="Cancelled" value={String(summary.totalCancelled)} />
        <SummaryStat label="Shipped (total)" value={String(summary.totalShipped)} />
        <SummaryStat label="Delivered" value={String(summary.totalDelivered)} />
        <SummaryStat label="RTO" value={String(summary.totalRto)} />
        <SummaryStat label="In transit" value={String(summary.stillInTransit)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Cancellation rate (k)" value={`${summary.cancellationRatePct.toFixed(1)}%`} highlight />
        <SummaryStat label="RTO rate (r)" value={`${summary.rtoRatePct.toFixed(1)}%`} highlight />
        <SummaryStat label="Cash collected (remitted)" value={formatPKR(summary.totalCashCollected)} />
        <SummaryStat label="Revenue placed" value={formatPKR(summary.totalRevenuePlaced)} />
      </div>

      {summary.totalPlaced > 0 && (
        <p className="font-body text-xs text-brand-charcoal/50">
          Carry the cancellation rate (k) and RTO rate (r) above into the Unit economics calculator on the{" "}
          <Link href="/admin/pricing" className="text-brand-umber underline">
            Pricing page
          </Link>{" "}
          to replace its guessed rates with your real ones.
        </p>
      )}
      <p className="font-body text-xs text-brand-charcoal/50">
        &quot;Cash collected&quot; means what the courier has actually remitted to you, not the order&apos;s face
        value — expect it to lag delivery by days or weeks, so it&apos;s normal for a freshly delivered order to
        show Rs 0 here until the next remittance.
      </p>

      <AdOrderLogForm />

      <div className="overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-brand-sky/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Date</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Source</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Ad</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Product</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Revenue</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Status</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Cash collected</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 text-brand-charcoal/80">{formatDate(entry.order_date)}</td>
                <td className="px-4 py-3 text-brand-charcoal/80">{SOURCE_LABEL[entry.source] ?? entry.source}</td>
                <td className="px-4 py-3 text-brand-charcoal/60">{entry.ad_name ?? "—"}</td>
                <td className="px-4 py-3 text-brand-charcoal">{entry.product_name}</td>
                <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(entry.revenue)}</td>
                <td className="px-4 py-3">
                  <StatusUpdateForm
                    action={updateAdOrderLogStatusAction.bind(null, entry.id)}
                    currentStatus={entry.status}
                    options={STATUSES}
                  />
                </td>
                <td className="px-4 py-3">
                  <AdOrderLogCashInput entryId={entry.id} initialValue={entry.cash_collected} />
                </td>
                <td className="px-4 py-3">
                  <DeleteAdOrderLogEntryButton action={deleteAdOrderLogEntryAction.bind(null, entry.id)} />
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-brand-charcoal/50">
                  No orders logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-brand-sky/40 bg-brand-sky/10" : "border-brand-umber/10 bg-brand-ivory"
      }`}
    >
      <p className="font-body text-xs text-brand-charcoal/60">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-brand-umber-dark">{value}</p>
    </div>
  );
}
