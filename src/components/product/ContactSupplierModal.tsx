"use client";

import { useState } from "react";

interface ProductMeta {
  _id: string;
  title: string;
  unit: string;
  moq: number;
  supplier: { _id: string };
}

interface Props {
  open: boolean;
  onClose: () => void;
  product: ProductMeta;
  defaultQuantity: number;
  sessionUser?: { id?: string | null; name?: string | null; email?: string | null } | null;
}

export default function ContactSupplierModal({ open, onClose, product, defaultQuantity, sessionUser }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: sessionUser?.name || "",
    email: sessionUser?.email || "",
    company: "",
    country: "",
    quantity: defaultQuantity || product.moq,
    unit: product.unit,
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  if (!open) return null;

  const handleFiles = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const f = evt.target.files ? Array.from(evt.target.files) : [];
    setFiles(f);
  };

  const filesToBase64 = async (f: File[]) => {
    const read = (file: File) => new Promise<{ name: string; type: string; size: number; data: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: String(reader.result) });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return Promise.all(f.map(read));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const attachments = await filesToBase64(files);
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          supplierId: product.supplier._id,
          buyerId: sessionUser?.id,
          buyerName: form.name || sessionUser?.name || 'Guest',
          buyerEmail: form.email || sessionUser?.email,
          companyName: form.company,
          country: form.country,
          quantity: form.quantity,
          unit: form.unit,
          message: form.message,
          contactMethod: 'chat',
          attachments,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send inquiry');
      alert('Inquiry sent successfully!');
      onClose();
      setForm({
        name: sessionUser?.name || "",
        email: sessionUser?.email || "",
        company: "",
        country: "",
        quantity: product.moq,
        unit: product.unit,
        message: "",
      });
      setFiles([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send inquiry';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl mx-auto rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Supplier</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Your Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="John Buyer" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Your Company" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Pakistan" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm text-gray-700 mb-1">Quantity</label>
              <input type="number" min={product.moq} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px]" placeholder={`Hello, I am interested in ${product.title}. Please provide more details.`} />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Attachments</label>
            <input type="file" multiple onChange={handleFiles} className="block w-full text-sm text-gray-600" />
            {files.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">{files.length} file(s) selected</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
