import { listCategories } from "@/lib/admin/queries";
import { createProduct } from "@/lib/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Add product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm categories={categories} onSubmit={createProduct} />
      </div>
    </div>
  );
}
