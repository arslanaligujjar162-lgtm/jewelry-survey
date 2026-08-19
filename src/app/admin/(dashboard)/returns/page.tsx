import Link from "next/link";
import { listReturnRequests, listOrders } from "@/lib/admin/queries";
import { updateReturnStatusAction } from "@/lib/admin/actions";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { formatDate } from "@/lib/format";

const STATUSES = ["requested", "approved", "rejected", "picked_up", "refunded"] as const;

export default async function AdminReturnsPage() {
  const [returns, orders] = await Promise.all([listReturnRequests(), listOrders()]);
  const orderIdByNumber = new Map(orders.map((o) => [o.order_number, o.id]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Return &amp; exchange requests</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-brand-sky-light/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Order</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Reason</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Requested</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {returns.map((r) => {
              const orderId = orderIdByNumber.get(r.order_number);
              return (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    {orderId ? (
                      <Link href={`/admin/orders/${orderId}`} className="font-medium text-brand-umber hover:underline">
                        {r.order_number}
                      </Link>
                    ) : (
                      r.order_number
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-brand-charcoal/80">{r.reason}</td>
                  <td className="px-4 py-3 text-brand-charcoal/70">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <StatusUpdateForm
                      action={updateReturnStatusAction.bind(null, r.id)}
                      currentStatus={r.status}
                      options={STATUSES}
                    />
                  </td>
                </tr>
              );
            })}
            {returns.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-charcoal/50">
                  No return requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
