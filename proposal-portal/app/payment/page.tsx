"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, CheckCircle, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

type Proposal = {
  tier: string;
  bookings: { id: string }[];
  payment: { status: string; amount: number } | null;
};

export default function PaymentPage() {
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetch("/api/proposal")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setProposal(d);
          if (d.payment?.status === "PAID") setPaid(true);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handlePay() {
    setError("");
    setPaying(true);
    const res = await fetch("/api/payment", { method: "POST" });
    setPaying(false);
    if (res.ok) {
      setPaid(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Payment failed");
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;

  const amount = proposal?.tier === "ENHANCED" ? 2500 : 1000;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-5 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {paid ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h2>
            <p className="text-gray-500">
              Thank you for your payment of{" "}
              <span className="font-semibold text-gray-800">${amount.toLocaleString()}</span>.
              We&apos;ll be in touch shortly.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                <CreditCard size={22} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            </div>

            {/* Order summary */}
            <div className="mb-5 rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Order Summary</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {proposal?.tier === "ENHANCED" ? "Enhanced Package" : "Basic Package"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {proposal?.tier === "ENHANCED"
                      ? "Deliverables + 10hrs 1-on-1 training"
                      : "Standard deliverables"}
                  </p>
                </div>
                <p className="text-xl font-bold text-gray-900">${amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Mock card form */}
            <div className="mb-5 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Card number</label>
                <input
                  type="text"
                  defaultValue="4242 4242 4242 4242"
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12 / 28"
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CVC</label>
                  <input
                    type="text"
                    defaultValue="123"
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {paying ? "Processing…" : `Pay $${amount.toLocaleString()}`}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
              <ShieldCheck size={13} /> Simulated checkout — no real charges
            </div>
          </>
        )}
      </div>
    </div>
  );
}
