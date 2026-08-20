import Link from "next/link";
import { listOrders, listProducts, listReturnRequests, listReviews } from "@/lib/admin/queries";

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminOverviewPage() {
  const [orders, products, returns, reviews] = await Promise.all([
    listOrders(),
    listProducts(),
    listReturnRequests(),
    listReviews(),
  ]);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const lowStockProducts = products.filter((p) => p.stock_count <= LOW_STOCK_THRESHOLD);
  const openReturns = returns.filter((r) => r.status === "requested").length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Overview</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending orders" value={pendingOrders} href="/admin/orders?status=pending" />
        <StatCard label="Low stock products" value={lowStockProducts.length} href="/admin/products" />
        <StatCard label="Open return requests" value={openReturns} href="/admin/returns" />
        <StatCard label="Reviews awaiting approval" value={pendingReviews} href="/admin/reviews" />
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
            Low stock
          </h2>
          <ul className="mt-3 divide-y divide-brand-umber/10 rounded-lg border border-brand-umber/10 bg-brand-ivory">
            {lowStockProducts.map((p) => (
              <li key={p.id} className="flex justify-between px-4 py-3 font-body text-sm">
                <Link href={`/admin/products/${p.id}`} className="text-brand-charcoal hover:text-brand-umber">
                  {p.name} ({p.sku})
                </Link>
                <span className="font-medium text-brand-error">{p.stock_count} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5 transition hover:border-brand-umber/30">
      <p className="font-body text-sm text-brand-charcoal/70">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-brand-umber-dark">{value}</p>
    </Link>
  );
}
