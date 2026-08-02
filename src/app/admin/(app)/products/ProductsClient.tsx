"use client";
import { useRef, useState, useTransition } from "react";
import { X, Plus, Pencil, ImageIcon, Tag } from "lucide-react";
import { toggleProductActive, createProduct, updateProduct } from "../../actions";

type Product = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  price: string;
  costPrice: string | null;
  isActive: boolean;
  images: string[];
  discountEnabled: boolean;
  discountType: string | null;
  discountValue: string | null;
  discountEndsAt: string | null;
  inventory: { id: string; flavor: string; stock: number }[];
  _count: { orderItems: number };
};

type FormState = { mode: "add" } | { mode: "edit"; product: Product };

function effectivePrice(p: Product): number {
  const sale = Number(p.price);
  if (!p.discountEnabled || !p.discountValue) return sale;
  if (p.discountEndsAt && new Date(p.discountEndsAt) < new Date()) return sale;
  const val = Number(p.discountValue);
  return p.discountType === "PERCENT"
    ? Math.max(0, sale * (1 - val / 100))
    : Math.max(0, sale - val);
}

export default function ProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [panel, setPanel] = useState<FormState | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle(id: string, active: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: active } : p)));
    startTransition(() => toggleProductActive(id, active));
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setPanel({ mode: "add" })}
          className="flex items-center gap-2 bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.2em] uppercase px-5 py-3 transition-colors"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((p) => {
          const stock = p.inventory.reduce((s, i) => s + i.stock, 0);
          const salePrice = Number(p.price);
          const cost = p.costPrice ? Number(p.costPrice) : null;
          const profit = cost !== null ? ((salePrice - cost) / salePrice) * 100 : null;
          const eff = effectivePrice(p);
          const discounted = eff < salePrice;
          const discountExpired = p.discountEndsAt ? new Date(p.discountEndsAt) < new Date() : false;

          return (
            <div key={p.id} className={`bg-brand-surface border p-5 ${p.isActive ? "border-brand-border" : "border-brand-border opacity-50"}`}>
              <div className="flex items-start gap-4 mb-4">
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-heading text-xl text-brand-white tracking-wide">{p.name}</h3>
                    <span className={`font-body text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border ${p.isActive ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-brand-muted border-brand-border"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                    {p.discountEnabled && !discountExpired && (
                      <span className="font-body text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border text-yellow-400 border-yellow-400/30 bg-yellow-400/10 flex items-center gap-1">
                        <Tag size={9} /> Sale
                      </span>
                    )}
                  </div>
                  {p.tagline && <p className="font-body text-xs text-brand-muted">{p.tagline}</p>}
                </div>

                <div className="text-right flex-shrink-0">
                  {discounted ? (
                    <>
                      <p className="font-body text-xs text-brand-muted line-through">${salePrice.toFixed(2)}</p>
                      <p className="font-heading text-2xl text-yellow-400">${eff.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="font-heading text-2xl text-brand-caramel">${salePrice.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted mb-1">Stock</p>
                  <p className="font-heading text-xl text-brand-white">{stock}</p>
                </div>
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted mb-1">Orders</p>
                  <p className="font-heading text-xl text-brand-white">{p._count.orderItems}</p>
                </div>
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted mb-1">Cost</p>
                  <p className="font-heading text-xl text-brand-white">{cost !== null ? `$${cost.toFixed(2)}` : "—"}</p>
                </div>
                <div className="bg-brand-card p-3">
                  <p className="font-body text-[9px] tracking-[0.1em] uppercase text-brand-muted mb-1">Profit</p>
                  <p className="font-heading text-xl text-green-400">{profit !== null ? `${profit.toFixed(0)}%` : "—"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button onClick={() => setPanel({ mode: "edit", product: p })} className="flex items-center gap-1.5 font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-brand-caramel/40 text-brand-caramel hover:bg-brand-caramel/10 transition-colors">
                  <Pencil size={11} /> Edit
                </button>
                <button disabled={pending} onClick={() => handleToggle(p.id, !p.isActive)} className={`font-body text-[10px] tracking-[0.15em] uppercase px-4 py-2 border transition-colors disabled:opacity-40 ${p.isActive ? "border-brand-border text-brand-muted hover:border-red-400/50 hover:text-red-400" : "border-green-400/30 text-green-400 hover:bg-green-400/10"}`}>
                  {p.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {panel && (
        <ProductPanel
          mode={panel.mode}
          product={panel.mode === "edit" ? panel.product : undefined}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  );
}

// ─── Slide panel ─────────────────────────────────────────────────────────────

function ProductPanel({ mode, product, onClose }: { mode: "add" | "edit"; product?: Product; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]               = useState(product?.images[0] ?? "");
  const [error, setError]                   = useState<string | null>(null);
  const [pending, startTransition]          = useTransition();
  const [costVal, setCostVal]               = useState(product?.costPrice ? Number(product.costPrice) : NaN);
  const [saleVal, setSaleVal]               = useState(product ? Number(product.price) : NaN);
  const [discountOn, setDiscountOn]         = useState(product?.discountEnabled ?? false);
  const [discountType, setDiscountType]     = useState<"FIXED" | "PERCENT">((product?.discountType as "FIXED" | "PERCENT") ?? "FIXED");
  const [discountVal, setDiscountVal]       = useState(product?.discountValue ? Number(product.discountValue) : NaN);
  const [tillDateOn, setTillDateOn]         = useState(!!product?.discountEndsAt);

  const stock = product?.inventory.reduce((s, i) => s + i.stock, 0) ?? 0;
  const profit = (!isNaN(costVal) && !isNaN(saleVal) && saleVal > 0)
    ? ((saleVal - costVal) / saleVal * 100).toFixed(1)
    : null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = formRef.current!;
    const data = new FormData(form);

    if (!(data.get("name") as string).trim()) { setError("Product name is required."); return; }
    if (!parseFloat(data.get("salePrice") as string)) { setError("A valid sale price is required."); return; }

    // Upload image if new file selected
    const file = fileRef.current?.files?.[0];
    let imageUrl = preview.startsWith("blob:") ? "" : preview;
    if (file && file.size > 0) {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: uploadForm });
      if (!res.ok) { setError((await res.json()).error ?? "Image upload failed."); return; }
      imageUrl = (await res.json()).url;
    }

    data.delete("image");
    data.set("imageUrl", imageUrl);
    data.set("discountEnabled", String(discountOn));
    data.set("discountType", discountType);
    data.set("tillDateEnabled", String(tillDateOn));

    startTransition(async () => {
      try {
        if (mode === "add") await createProduct(data);
        else await updateProduct(product!.id, data);
        onClose();
      } catch (err) {
        setError((err as Error).message ?? "Something went wrong.");
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-brand-surface border-l border-brand-border flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
          <span className="font-heading text-xl text-brand-white tracking-wide">{mode === "add" ? "ADD PRODUCT" : "EDIT PRODUCT"}</span>
          <button onClick={onClose} className="p-1.5 text-brand-muted hover:text-brand-white transition-colors"><X size={18} /></button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Image */}
          <div>
            <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">Product Image</label>
            <div className="relative w-full h-40 bg-brand-card border border-brand-border flex items-center justify-center cursor-pointer overflow-hidden group" onClick={() => fileRef.current?.click()}>
              {preview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-brand-muted group-hover:text-brand-white transition-colors"><ImageIcon size={28} /><span className="font-body text-xs">Click to upload</span></div>
              }
              {preview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="font-body text-xs text-white">Change image</span></div>}
            </div>
            <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Name + Tagline */}
          <FF label="Product Name *" name="name" placeholder="e.g. Caramel Crunch" defaultValue={product?.name} />
          <FF label="Sub Text / Tagline" name="tagline" placeholder="e.g. Our Signature Bar" defaultValue={product?.tagline ?? ""} required={false} />

          {/* Cost + Sale price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">Your Cost</label>
              <input type="number" name="costPrice" step="0.01" min="0" placeholder="0.00"
                defaultValue={product?.costPrice ? Number(product.costPrice).toFixed(2) : ""}
                onChange={(e) => setCostVal(parseFloat(e.target.value))}
                className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-3 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-caramel/60 transition-colors" />
            </div>
            <div>
              <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">Sale Cost *</label>
              <input type="number" name="salePrice" step="0.01" min="0" required placeholder="0.00"
                defaultValue={product ? Number(product.price).toFixed(2) : ""}
                onChange={(e) => setSaleVal(parseFloat(e.target.value))}
                className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-3 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-caramel/60 transition-colors" />
            </div>
          </div>

          {/* Profit % indicator */}
          <div className="flex items-center justify-between bg-brand-card border border-brand-border px-4 py-3">
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">Profit Margin</span>
            <span className={`font-heading text-2xl ${profit !== null && parseFloat(profit) > 0 ? "text-green-400" : "text-brand-muted"}`}>
              {profit !== null ? `${profit}%` : "—"}
            </span>
          </div>

          {/* Stock */}
          <FF label="Stock" name="stock" placeholder="100" type="number" defaultValue={String(stock)} required={false} />

          {/* ── Discount ── */}
          <div className="border border-brand-border">
            <button type="button" onClick={() => setDiscountOn(!discountOn)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-card transition-colors">
              <div className="flex items-center gap-2">
                <Tag size={13} className={discountOn ? "text-yellow-400" : "text-brand-muted"} />
                <span className="font-body text-xs font-semibold tracking-[0.1em] uppercase text-brand-white">Discount</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${discountOn ? "bg-yellow-400" : "bg-brand-card border border-brand-border"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${discountOn ? "left-5" : "left-0.5"}`} />
              </div>
            </button>

            {discountOn && (
              <div className="px-4 pb-4 space-y-4 border-t border-brand-border pt-4">
                {/* Type */}
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["FIXED", "PERCENT"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setDiscountType(t)}
                        className={`py-2 font-body text-xs font-semibold tracking-[0.15em] uppercase transition-colors border ${discountType === t ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-400" : "border-brand-border text-brand-muted hover:text-brand-white"}`}>
                        {t === "FIXED" ? "Fixed ($)" : "Percent (%)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">
                    Discount {discountType === "FIXED" ? "Amount ($)" : "Percentage (%)"}
                  </label>
                  <input type="number" name="discountValue" step="0.01" min="0"
                    max={discountType === "PERCENT" ? "100" : undefined}
                    placeholder={discountType === "FIXED" ? "e.g. 0.50" : "e.g. 10"}
                    defaultValue={product?.discountValue ? Number(product.discountValue).toFixed(2) : ""}
                    onChange={(e) => setDiscountVal(parseFloat(e.target.value))}
                    className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-3 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-yellow-400/60 transition-colors" />
                </div>

                {/* Effective price preview */}
                {!isNaN(saleVal) && !isNaN(discountVal) && (
                  <div className="flex items-center justify-between bg-brand-black px-3 py-2">
                    <span className="font-body text-[10px] text-brand-muted tracking-[0.1em] uppercase">Effective Price</span>
                    <span className="font-heading text-xl text-yellow-400">
                      ${Math.max(0, discountType === "PERCENT"
                        ? saleVal * (1 - discountVal / 100)
                        : saleVal - discountVal
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Till date toggle */}
                <div>
                  <button type="button" onClick={() => setTillDateOn(!tillDateOn)}
                    className="flex items-center justify-between w-full">
                    <span className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted">Ends on date</span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${tillDateOn ? "bg-yellow-400" : "bg-brand-card border border-brand-border"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${tillDateOn ? "left-4" : "left-0.5"}`} />
                    </div>
                  </button>

                  {tillDateOn && (
                    <input type="datetime-local" name="discountEndsAt"
                      defaultValue={product?.discountEndsAt
                        ? new Date(product.discountEndsAt).toISOString().slice(0, 16)
                        : ""}
                      className="mt-2 w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-3 py-3 focus:outline-none focus:border-yellow-400/60 transition-colors" />
                  )}
                </div>
              </div>
            )}
          </div>

          {error && <p className="font-body text-xs text-brand-flame border border-brand-flame/25 bg-brand-flame/5 px-4 py-3">{error}</p>}
        </form>

        <div className="px-6 py-5 border-t border-brand-border flex-shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-brand-border text-brand-muted hover:text-brand-white font-body text-xs tracking-[0.15em] uppercase py-3 transition-colors">Cancel</button>
          <button type="button" disabled={pending} onClick={() => formRef.current?.requestSubmit()}
            className="flex-1 bg-brand-flame hover:bg-brand-flame-dark disabled:opacity-60 text-white font-body text-xs font-semibold tracking-[0.2em] uppercase py-3 transition-colors">
            {pending ? "Saving…" : mode === "add" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

function FF({ label, name, placeholder, type = "text", step, defaultValue = "", required = true }:
  { label: string; name: string; placeholder: string; type?: string; step?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">{label}</label>
      <input type={type} name={name} placeholder={placeholder} defaultValue={defaultValue} required={required} step={step}
        min={type === "number" ? "0" : undefined}
        className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-caramel/60 transition-colors" />
    </div>
  );
}
