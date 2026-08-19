import { notFound } from "next/navigation";
import { getProduct, listCategories } from "@/lib/admin/queries";
import { updateProduct, deleteProduct } from "@/lib/admin/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([getProduct(params.id), listCategories()]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Edit product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm
          product={product}
          categories={categories}
          onSubmit={updateProduct.bind(null, product.id)}
          onDelete={deleteProduct.bind(null, product.id)}
        />
      </div>
    </div>
  );
}
