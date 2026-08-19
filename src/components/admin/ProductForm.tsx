"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";

interface ProductFormValues {
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  plating_spec: string;
  material_spec: string;
  images: string[];
  stock_count: number;
  is_new: boolean;
  ring_size_range: string | null;
}

export function ProductForm({
  product,
  categories,
  onSubmit,
  onDelete,
}: {
  product?: Product;
  categories: Category[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const router = useRouter();
  const [sku, setSku] = useState(product?.sku ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [platingSpec, setPlatingSpec] = useState(product?.plating_spec ?? "18k gold PVD coating over 316L stainless steel");
  const [materialSpec, setMaterialSpec] = useState(product?.material_spec ?? "316L stainless steel, PVD gold plated");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [stockCount, setStockCount] = useState(product?.stock_count?.toString() ?? "0");
  const [isNew, setIsNew] = useState(product?.is_new ?? false);
  const [ringSizeRange, setRingSizeRange] = useState(product?.ring_size_range ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setImages((prev) => [...prev, data.publicUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        sku,
        name,
        slug,
        category_id: categoryId,
        price: Number(price),
        compare_at_price: null,
        description,
        plating_spec: platingSpec,
        material_spec: materialSpec,
        images,
        stock_count: Number(stockCount),
        is_new: isNew,
        ring_size_range: ringSizeRange.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Delete this product? This can't be undone.")) return;
    await onDelete();
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="SKU" value={sku} onChange={setSku} required />
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField label="Slug" value={slug} onChange={setSlug} required hint="URL-safe, e.g. amber-signet-ring" />
        <div>
          <label className="block font-body text-sm font-medium text-brand-charcoal">
            <span className="mb-1.5 block">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextField label="Price (PKR)" value={price} onChange={setPrice} type="number" required />
        <TextField label="Stock count" value={stockCount} onChange={setStockCount} type="number" required />
        <TextField label="Ring size range (rings only)" value={ringSizeRange} onChange={setRingSizeRange} hint="e.g. US 5-9, leave blank otherwise" />
        <label className="flex items-center gap-2 font-body text-sm text-brand-charcoal">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          Mark as new arrival
        </label>
      </div>

      <TextArea label="Description" value={description} onChange={setDescription} rows={3} required />
      <TextField label="Plating spec" value={platingSpec} onChange={setPlatingSpec} required />
      <TextField label="Material spec" value={materialSpec} onChange={setMaterialSpec} required />

      <div>
        <span className="block font-body text-sm font-medium text-brand-charcoal">Images</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div key={src} className="relative h-20 w-20 overflow-hidden rounded-lg bg-brand-sky-light">
              <Image src={src} alt={`Product image ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-0 top-0 rounded-bl bg-brand-error px-1.5 py-0.5 text-[10px] text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="mt-3 inline-block cursor-pointer rounded-lg border border-brand-umber/30 px-4 py-2 font-body text-xs text-brand-umber-dark">
          {uploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        <p className="mt-1 font-body text-xs text-brand-charcoal/50">
          Uploads to Supabase Storage (product-images bucket).
        </p>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-brand-error">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-umber px-6 py-2.5 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
        >
          {saving ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-brand-error/40 px-6 py-2.5 font-body text-sm font-semibold text-brand-error"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block font-body text-sm font-medium text-brand-charcoal">
      <span className="mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="input" />
      {hint && <span className="mt-1 block font-body text-xs font-normal text-brand-charcoal/50">{hint}</span>}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block font-body text-sm font-medium text-brand-charcoal">
      <span className="mb-1.5 block">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} required={required} className="input" />
    </label>
  );
}
