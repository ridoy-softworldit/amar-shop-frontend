/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/InvoiceButton.tsx
import React from "react";
import { customerDownloadInvoicePdf } from "@/services/invoiceService";

export default function InvoiceButton({
  invoiceId,
}: {
  invoiceId?: string | number;
}) {
  const onClick = async () => {
    if (!invoiceId) return alert("No invoice available");
    try {
      const res = await customerDownloadInvoicePdf(invoiceId);
      if ((res as any).status === "pending") {
        alert("Invoice PDF is generating. Try again in a few seconds.");
        return;
      }
      const blob = res as Blob;
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Error downloading invoice: " + String(err));
    }
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-1 bg-blue-600 text-white rounded"
    >
      View / Download Invoice
    </button>
  );
}
