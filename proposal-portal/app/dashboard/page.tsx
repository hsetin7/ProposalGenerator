"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Layers,
  LogOut,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";

type Proposal = {
  id: string;
  tier: string;
  status: string;
  bookings: { id: string }[];
  payment: { status: string; amount: number } | null;
};

const SCOPE_ITEMS = [
  "Custom Power BI dashboard with 5+ report pages",
  "Azure data pipeline setup (ADF + Synapse)",
  "SQL data model design & optimization",
  "Training documentation & knowledge transfer",
  "30-day post-delivery support",
];

const TIMELINE = [
  { week: "Week 1–2", task: "Discovery & data audit" },
  { week: "Week 3–4", task: "Pipeline & model build" },
  { week: "Week 5–6", task: "Dashboard development" },
  { week: "Week 7", task: "UAT & revisions" },
  { week: "Week 8", task: "Go-live & handoff" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/proposal")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setProposal(d); })
      .finally(() => setLoading(false));
  }, [router]);

  async function selectTier(tier: string) {
    setSaving(true);
    const res = await fetch("/api/proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) setProposal(await res.json());
    setSaving(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;

  const canProceed =
    proposal?.tier === "BASIC" ||
    (proposal?.tier === "ENHANCED" && (proposal?.bookings?.length ?? 0) >= 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Proposal</h1>
        <button onClick={logout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <LogOut size={15} /> Sign out
        </button>
      </div>

      {/* Project Scope */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Layers size={18} className="text-blue-600" /> Project Scope
        </h2>
        <ul className="space-y-2">
          {SCOPE_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle size={15} className="mt-0.5 shrink-0 text-green-500" /> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Clock size={18} className="text-blue-600" /> Timeline (8 weeks)
        </h2>
        <div className="space-y-2">
          {TIMELINE.map(({ week, task }) => (
            <div key={week} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 font-medium text-blue-600">{week}</span>
              <span className="text-gray-700">{task}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Selection */}
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Star size={18} className="text-blue-600" /> Select Your Tier
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Basic */}
          <button
            onClick={() => selectTier("BASIC")}
            disabled={saving}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              proposal?.tier === "BASIC"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Basic</span>
              <span className="text-lg font-bold text-gray-900">$1,000</span>
            </div>
            <p className="text-sm text-gray-500">Standard deliverables — dashboard, pipeline & docs.</p>
            {proposal?.tier === "BASIC" && (
              <span className="mt-2 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                Selected
              </span>
            )}
          </button>

          {/* Enhanced */}
          <button
            onClick={() => selectTier("ENHANCED")}
            disabled={saving}
            className={`rounded-xl border-2 p-5 text-left transition-all ${
              proposal?.tier === "ENHANCED"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Enhanced</span>
              <span className="text-lg font-bold text-gray-900">$2,500</span>
            </div>
            <p className="text-sm text-gray-500">
              Everything in Basic + 10 hours of 1-on-1 training (5 × 2hr sessions).
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
              <Zap size={12} /> Includes training sessions
            </div>
            {proposal?.tier === "ENHANCED" && (
              <span className="mt-2 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                Selected
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Enhanced booking prompt */}
      {proposal?.tier === "ENHANCED" && (proposal?.bookings?.length ?? 0) < 5 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;ve selected Enhanced — please book your{" "}
          <strong>5 training sessions</strong> before proceeding to payment.
          ({proposal?.bookings?.length ?? 0}/5 booked)
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {proposal?.tier === "ENHANCED" && (
          <button
            onClick={() => router.push("/booking")}
            className="flex items-center gap-1 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Manage Bookings ({proposal?.bookings?.length ?? 0}/5)
            <ChevronRight size={15} />
          </button>
        )}

        {proposal?.payment ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-semibold text-green-700">
            <CheckCircle size={16} /> Paid — ${proposal.payment.amount.toLocaleString()}
          </div>
        ) : (
          <button
            disabled={!canProceed || saving}
            onClick={() => router.push("/payment")}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Proceed to Payment <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
