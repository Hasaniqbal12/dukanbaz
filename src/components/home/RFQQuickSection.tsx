"use client";

import { useState } from "react";

export default function RFQQuickSection() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ productName: "", quantity: "", details: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName,
          quantity: Number(form.quantity) || undefined,
          specifications: form.details,
          contactMethod: "platform",
          urgency: "normal",
        }),
      });
      setForm({ productName: "", quantity: "", details: "" });
      // Could show toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Post a Request for Quotation</h2>
          <span className="text-sm text-gray-500">Get multiple quotes in 24 hours</span>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="md:col-span-2 input border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="What are you looking for?"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
          />
          <input
            className="md:col-span-1 input border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            className="md:col-span-1 input border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Specifications (optional)"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-1 inline-flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Get Quotes"}
          </button>
        </form>
      </div>
    </section>
  );
}
