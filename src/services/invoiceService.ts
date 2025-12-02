// frontend/src/services/invoiceService.ts
const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export async function customerDownloadInvoicePdf(id: string | number) {
  const res = await fetch(`${API}/api/v1/admin/invoices/${id}/pdf`, {
    credentials: "include",
  });
  if (res.status === 202) return { status: "pending" };
  if (!res.ok) throw new Error("Failed to fetch invoice");
  const blob = await res.blob();
  return blob;
}
