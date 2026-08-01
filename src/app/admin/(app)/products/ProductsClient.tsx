"use client";
import { useRef, useState, useTransition } from "react";
import { X, Plus, Pencil, ImageIcon } from "lucide-react";
import { toggleProductActive, createProduct, updateProduct } from "../../actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: string;
  isActive: boolean;
  images: string[];
  inventory: { id: string; flavor: string; stock: number }[];
  _count: { orderItems: number };
};

type FormState = { mode: "add" } | { mode: "edit"; product: Product };

export default function ProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [panel, setPanel]       = useState<FormState | null>(null);
  const [pending, startTransition] = useTransition();

  function openAdd()              { setPanel({ mode: "add" }); }
  function openEdit(p: Product)   { setPanel({ mode: "edit", product: p }); }
  function closePanel()           { setPanel(null); }

  function handleToggle(id: string, active: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: active } : p)));
    startTransition(() => toggleProductActive(id, active));
  }

  return (
    <>
      {/* Add button (lives in the header row — passed via portal trick is complex; embed here) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.2em] uppercase px-5 py-3 transition-colors"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((p) => {
          const stock = p.inventory.reduce((s, i) => s + i.stock, 0);
          return (
            <div
              key={p.id}
              className={`bg-brand-surface border p-5 transition-opacity ${
                p.isActive ? "border-brand-border" : "border-brand-border opacity-50"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 bg-brand-card border border-brand-border overflow-hidden">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={20} className="text-brand-muted" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-heading text-xl text-brand-white tracking-wide">{p.name}</h3>
                    <span className={`font-body text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border ${
                      p.isActive
                        ? "text-green-400 border-green-400/30 bg-green-400/10"
                        : "text-brand-muted border-brand-border"
                    }`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {p.tagline && <p className="font-body text-xs text-brand-muted">{p.tagline}</p>}
                </div>

                <span className="font-heading text-2xl text-brand-caramel flex-shrink-0">
                  ${Number(p.price).toFixed(2)}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">Stock</p>
                  <p className="font-heading text-2xl text-brand-white">{stock}</p>
                </div>
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted mb-1">Orders</p>
                  <p className="font-heading text-2xl text-brand-white">{p._count.orderItems}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-brand-caramel/40 text-brand-caramel hover:bg-brand-caramel/10 transition-colors"
                >
                  <Pencil size={11} />
                  Edit
                </button>

                <button
                  disabled={pending}
                  onClick={() => handleToggle(p.id, !p.isActive)}
                  className={`font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 border transition-colors disabled:opacity-40 ${
                    p.isActive
                      ? "border-brand-border text-brand-muted hover:border-red-400/50 hover:text-red-400"
                      : "border-green-400/30 text-green-400 hover:bg-green-400/10"
                  }`}
                >
                  {p.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide panel */}
      {panel && (
        <ProductPanel
          mode={panel.mode}
          product={panel.mode === "edit" ? panel.product : undefined}
          onClose={closePanel}
        />
      )}
    </>
  );
}

// ─── Slide panel ────────────────────────────────────────────────────────────

function ProductPanel({
  mode,
  product,
  onClose,
}: {
  mode: "add" | "edit";
  product?: Product;
  onClose: () => void;
}) {
  const formRef   = useRef<HTMLFormElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(product?.images[0] ?? "");
  const [error,   setError]   = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stock = product?.inventory.reduce((s, i) => s + i.stock, 0) ?? 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = formRef.current!;
    const data = new FormData(form);

    if (!(data.get("name") as string).trim()) {
      setError("Product name is required.");
      return;
    }
    if (!parseFloat(data.get("price") as string)) {
      setError("A valid price is required.");
      return;
    }

    // Upload image first via API route, then pass URL to server action
    const file = fileRef.current?.files?.[0];
    let imageUrl = preview.startsWith("blob:") ? "" : preview; // keep existing URL on edit

    if (file && file.size > 0) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        const res = await fetch("/api/admin/upload-image", { method: "POST", body: uploadForm });
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Image upload failed.");
          return;
        }
        const json = await res.json();
        imageUrl = json.url;
      } catch {
        setError("Image upload failed. Please try again.");
        return;
      }
    }

    data.set("imageUrl", imageUrl);

    startTransition(async () => {
      try {
        if (mode === "add") {
          await createProduct(data);
        } else {
          await updateProduct(product!.id, data);
        }
        onClose();
      } catch (err) {
        setError((err as Error).message ?? "Something went wrong.");
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-brand-surface border-l border-brand-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
          <span className="font-heading text-xl text-brand-white tracking-wide">
            {mode === "add" ? "ADD PRODUCT" : "EDIT PRODUCT"}
          </span>
          <button onClick={onClose} className="p-1.5 text-brand-muted hover:text-brand-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Image upload */}
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">
              Product Image
            </label>
            <div
              className="relative w-full h-44 bg-brand-card border border-brand-border flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-brand-muted group-hover:text-brand-white transition-colors">
                  <ImageIcon size={28} />
                  <span className="font-body text-xs tracking-[0.1em]">Click to upload image</span>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="font-body text-xs text-white tracking-[0.1em]">Change image</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <FormField label="Product Name *" name="name" placeholder="e.g. Caramel Crunch" defaultValue={product?.name} />

          {/* Price */}
          <FormField label="Price (USD) *" name="price" placeholder="3.49" type="number" step="0.01" defaultValue={product ? Number(product.price).toFixed(2) : ""} />

          {/* Sub text */}
          <FormField label="Sub Text / Tagline" name="tagline" placeholder="e.g. Our Signature Bar" defaultValue={product?.tagline ?? ""} required={false} />

          {/* Stock */}
          <FormField label="Stock" name="stock" placeholder="100" type="number" defaultValue={String(stock)} required={false} />

          {error && (
            <p className="font-body text-xs text-brand-flame border border-brand-flame/25 bg-brand-flame/5 px-4 py-3">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-brand-border flex-shrink-0 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-brand-border text-brand-muted hover:text-brand-white font-body text-xs tracking-[0.15em] uppercase py-3 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formRef.current?.id}
            disabled={pending}
            onClick={() => formRef.current?.requestSubmit()}
            className="flex-1 bg-brand-flame hover:bg-brand-flame-dark disabled:opacity-60 text-white font-body text-xs font-semibold tracking-[0.2em] uppercase py-3 transition-colors"
          >
            {pending ? "Saving…" : mode === "add" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  step,
  defaultValue = "",
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        step={step}
        min={type === "number" ? "0" : undefined}
        className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-caramel/60 transition-colors"
      />
    </div>
  );
}
