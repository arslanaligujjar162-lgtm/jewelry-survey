import Link from "next/link";
import { listProducts } from "@/lib/admin/queries";
import { formatPKR } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-umber px-5 py-2 font-body text-sm font-semibold text-brand-ivory"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-brand-sky-light/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">SKU</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Name</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Category</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Price</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-brand-charcoal/70">{p.sku}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-brand-umber hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-charcoal/70">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-brand-charcoal/70">{formatPKR(p.price)}</td>
                <td className={`px-4 py-3 ${p.stock_count <= 5 ? "text-brand-error" : "text-brand-charcoal/70"}`}>
                  {p.stock_count}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-charcoal/50">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
