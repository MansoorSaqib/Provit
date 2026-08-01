import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  if (!order) redirect("/");

  const short = order.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-40 pb-20 text-center">

        {/* Check mark */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-green-400/30 bg-green-400/10 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-green-400">
            <path d="M7 19l8 8 14-16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-brand-muted mb-4">
          Order Confirmed
        </p>
        <h1 className="font-heading text-5xl lg:text-6xl text-brand-white tracking-wide mb-4">
          THANK YOU!
        </h1>
        <p className="font-body text-sm text-brand-muted mb-8 leading-relaxed">
          Your order has been placed and is being processed.<br />
          We&apos;ll be in touch with updates.
        </p>

        {/* Order number chip */}
        <div className="inline-block border border-brand-border bg-brand-surface px-8 py-5 mb-12">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-brand-muted mb-1">Order Number</p>
          <p className="font-heading text-3xl text-brand-caramel tracking-widest">#{short}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/account"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-flame hover:bg-brand-flame-dark text-white font-body text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            View My Orders
          </a>
          <a
            href="/#products"
            className="inline-flex items-center justify-center px-8 py-4 border border-brand-border text-brand-muted hover:text-brand-white hover:border-brand-muted font-body text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
