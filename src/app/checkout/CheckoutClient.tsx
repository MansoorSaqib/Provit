"use client";
import { useRef, useState, useTransition } from "react";
import { placeOrder } from "./actions";

type CartItem = {
  id: string;
  quantity: number;
  flavor: string;
  product: { id: string; name: string; price: string; slug: string };
};

export default function CheckoutClient({ items }: { items: CartItem[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = formRef.current!;
    const data = new FormData(form);

    const required = ["fullName", "line1", "city", "state", "postalCode"];
    for (const field of required) {
      if (!(data.get(field) as string)?.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }

    startTransition(() => {
      placeOrder(data);
    });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Shipping form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-brand-surface border border-brand-border p-6">
          <h2 className="font-heading text-2xl text-brand-white tracking-wide mb-6">SHIPPING ADDRESS</h2>

          <div className="space-y-4">
            <Field label="Full Name *" name="fullName" placeholder="John Doe" />
            <Field label="Address Line 1 *" name="line1" placeholder="123 Main Street" />
            <Field label="Address Line 2" name="line2" placeholder="Apt, Suite, etc. (optional)" required={false} />

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City *" name="city" placeholder="Karachi" />
              <Field label="State / Province *" name="state" placeholder="Sindh" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Postal Code *" name="postalCode" placeholder="75000" />
              <div>
                <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">
                  Country *
                </label>
                <select
                  name="country"
                  defaultValue="PK"
                  className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 focus:outline-none focus:border-brand-caramel/60 transition-colors appearance-none"
                >
                  <option value="PK">Pakistan</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="AE">UAE</option>
                  <option value="SA">Saudi Arabia</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="font-body text-xs text-brand-flame border border-brand-flame/25 bg-brand-flame/5 px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-flame hover:bg-brand-flame-dark disabled:opacity-60 text-white font-body text-xs font-semibold tracking-[0.25em] uppercase py-4 transition-colors"
        >
          {pending ? "Placing Order…" : "Place Order"}
        </button>

        <p className="font-body text-[10px] text-brand-muted text-center tracking-[0.1em]">
          No payment required — orders are processed manually.
        </p>
      </form>

      {/* Order summary */}
      <div className="bg-brand-surface border border-brand-border p-6 sticky top-24">
        <h2 className="font-heading text-2xl text-brand-white tracking-wide mb-5">ORDER SUMMARY</h2>

        <div className="space-y-3 mb-5 pb-5 border-b border-brand-border">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-body text-xs text-brand-white leading-snug">{item.product.name}</p>
                <p className="font-body text-[10px] text-brand-muted">{item.flavor} × {item.quantity}</p>
              </div>
              <span className="font-heading text-lg text-brand-white flex-shrink-0">
                ${(Number(item.product.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-5 pb-5 border-b border-brand-border">
          <div className="flex justify-between font-body text-xs text-brand-muted">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body text-xs text-brand-muted">
            <span>Shipping</span>
            <span className="text-green-400">Free</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="font-body text-sm font-semibold text-brand-white">Total</span>
          <span className="font-heading text-3xl text-brand-white">${subtotal.toFixed(2)}</span>
        </div>

        <a
          href="/cart"
          className="block mt-6 text-center font-body text-[10px] tracking-[0.15em] uppercase text-brand-muted hover:text-brand-white transition-colors"
        >
          ← Back to Cart
        </a>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-muted block mb-2">
        {label}
      </label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full bg-brand-card border border-brand-border text-brand-white font-body text-sm px-4 py-3 placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-caramel/60 transition-colors"
      />
    </div>
  );
}
