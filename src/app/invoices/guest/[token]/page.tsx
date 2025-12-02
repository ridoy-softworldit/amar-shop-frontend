/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/app/invoices/guest/[token]/page.tsx  (client component or server fetch)
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function GuestInvoicePage() {
  const params = useParams();
  const token = params.token;
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/invoices/guest/${token}`
    )
      .then((r) => r.json())
      .then(setInvoice)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (invoice) {
      setTimeout(() => window.print(), 600);
    }
  }, [invoice]);

  if (loading) return <div>Loading…</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        Invoice {invoice.invoiceNumber ?? invoice.invoiceNumber}
      </h1>
      <div>{invoice.customerContact?.name}</div>
      <div>{invoice.customerContact?.email}</div>

      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">Unit</th>
            <th className="border px-2 py-1">Line</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((it: any) => (
            <tr key={it._id}>
              <td className="border px-2 py-1">{it.description}</td>
              <td className="border px-2 py-1">{it.quantity}</td>
              <td className="border px-2 py-1">{it.unitPrice}</td>
              <td className="border px-2 py-1">{it.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right">
        <div>Subtotal: {invoice.subtotal}</div>
        <div>Tax: {invoice.taxTotal}</div>
        <div>Discount: {invoice.discountAmount}</div>
        <div className="text-xl font-bold">Total: {invoice.total}</div>
      </div>
    </div>
  );
}
