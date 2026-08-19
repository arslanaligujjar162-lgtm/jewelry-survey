import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/admin/queries";
import { updateOrderStatusAction } from "@/lib/admin/actions";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { formatPKR, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "dispatched", "delivered", "returned", "cancelled"];

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="font-body text-xs text-brand-umber hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">{order.order_number}</h1>
        <StatusUpdateForm action={updateOrderStatusAction.bind(null, order.id)} currentStatus={order.status} options={STATUSES} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
            <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Items</h2>
            <ul className="mt-3 divide-y divide-brand-umber/10 font-body text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span>
                    {item.name} × {item.quantity}
                    {item.ring_size ? ` (US ${item.ring_size})` : ""} — SKU {item.sku}
                  </span>
                  <span>{formatPKR(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-brand-umber/10 pt-3 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-brand-charcoal/70">Subtotal</span>
                <span>{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-charcoal/70">Discount</span>
                <span>−{formatPKR(order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-charcoal/70">Delivery</span>
                <span>{formatPKR(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-umber/10 pt-2 font-semibold">
                <span>Total</span>
                <span>{formatPKR(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
            <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
              Shipping address
            </h2>
            <p className="mt-2 font-body text-sm text-brand-charcoal/80">
              {order.shipping_address.fullName}
              <br />
              {order.shipping_address.addressLine1}
              {order.shipping_address.addressLine2 ? `, ${order.shipping_address.addressLine2}` : ""}
              <br />
              {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postalCode}
            </p>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-brand-umber/10 bg-brand-ivory p-5 font-body text-sm">
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Details</h2>
          <dl className="mt-3 space-y-2">
            <Row label="Placed" value={formatDate(order.created_at)} />
            <Row label="Phone" value={order.customer_phone} />
            <Row label="Payment method" value={order.payment_method === "cod" ? "Cash on Delivery" : "Online gateway"} />
            <Row label="Payment status" value={order.payment_status} />
            <Row label="OTP verified" value={order.otp_verified ? "Yes" : "No"} />
            <Row label="Promo code" value={order.promo_code ?? "—"} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-brand-charcoal/60">{label}</dt>
      <dd className="text-right capitalize text-brand-charcoal">{value}</dd>
    </div>
  );
}
