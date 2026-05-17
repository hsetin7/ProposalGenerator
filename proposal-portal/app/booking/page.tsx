"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Trash2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

type Booking = { id: string; startTime: string; endTime: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function BookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/booking")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setBookings(d); })
      .finally(() => setLoading(false));
  }, [router]);

  async function addBooking() {
    if (!selectedDate) { setError("Please pick a date"); return; }
    setError("");
    setSaving(true);
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime }),
    });
    setSaving(false);
    if (res.ok) {
      const booking = await res.json();
      setBookings((prev) => [...prev, booking]);
      setSelectedDate("");
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to book slot");
    }
  }

  async function removeBooking(id: string) {
    const res = await fetch("/api/booking", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    });
    if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  const today = new Date().toISOString().split("T")[0];
  const allBooked = bookings.length >= 5;

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Back to proposal
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
          <CalendarDays size={18} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Book Training Sessions</h1>
          <p className="text-sm text-gray-500">Select 5 × 2-hour slots ({bookings.length}/5 booked)</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-full bg-gray-200" style={{ height: 8 }}>
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${(bookings.length / 5) * 100}%` }}
        />
      </div>

      {/* Existing bookings */}
      {bookings.length > 0 && (
        <div className="mb-6 space-y-2">
          {bookings.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(b.startTime)}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={11} /> 2 hours — ends {formatDate(b.endTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeBooking(b.id)}
                className="text-gray-400 hover:text-red-500"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {allBooked ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle size={16} /> All 5 sessions booked! Head back to proceed to payment.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Add a session</h2>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={addBooking}
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Booking…" : "Book This Slot"}
          </button>
        </div>
      )}

      <button
        onClick={() => router.push("/dashboard")}
        className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
