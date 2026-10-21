import Link from "next/link";
import { listOrders } from "@/lib/admin/queries";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { formatPKR, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "dispatched", "delivered", "returned", "cancelled"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = STATUSES.includes(searchParams.status as OrderStatus) ? (searchParams.status as OrderStatus) : undefined;
  const orders = await listOrders(status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Orders</h1>
        <div className="flex flex-wrap gap-2">
          <FilterLink label="All" active={!status} href="/admin/orders" />
          {STATUSES.map((s) => (
            <FilterLink key={s} label={s} active={status === s} href={`/admin/orders?status=${s}`} />
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-brand-sky/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Order</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Customer</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Total</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Placed</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-umber hover:underline">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-charcoal/80">
                  {order.customer_name}
                  <br />
                  <span className="text-xs text-brand-charcoal/50">{order.customer_phone}</span>
                </td>
                <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(order.total)}</td>
                <td className="px-4 py-3 text-brand-charcoal/80">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <StatusUpdateForm
                    action={updateOrderStatusAction.bind(null, order.id)}
                    currentStatus={order.status}
                    options={STATUSES}
                  />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-charcoal/50">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 font-body text-xs capitalize ${
        active ? "border-brand-umber bg-brand-umber text-brand-ivory" : "border-brand-umber/20 text-brand-charcoal"
      }`}
    >
      {label}
    </Link>
  );
}
