/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useGetProductByIdQuery } from "@/services/catalog.api";
import { Package } from "lucide-react";

export default function GuestInvoicePage() {
  const params = useParams();
  const orderId = params.token as string;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${API}/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setOrder(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-cyan-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600">The order you`&apos;`re looking for doesn`&apos;`t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-3">
        <div className="bg-white border border-gray-300 shadow-lg p-4 print-area">
          {/* Header */}
          <div className="border-b border-gray-300 pb-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                  <Image
                    src="/logo-amar-shop.jpg"
                    alt="Amar Shop Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">INVOICE</h1>
                  <p className="text-xs text-gray-600">#{order._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium no-print"
              >
                Print
              </button>
            </div>
            <div className="text-xs text-gray-700 flex gap-4">
              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Status: <span className="font-semibold text-green-600">{order.status}</span></span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-3">
            <h2 className="text-sm font-bold text-black mb-1.5">BILL TO</h2>
            <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs">
              <p className="text-black mb-0.5"><span className="font-semibold">Name:</span> {order.customer?.name}</p>
              <p className="text-black mb-0.5"><span className="font-semibold">Phone:</span> {order.customer?.phone}</p>
              <p className="text-black"><span className="font-semibold">Address:</span> {order.customer?.houseOrVillage}, {order.customer?.roadOrPostOffice}, {order.customer?.blockOrThana}, {order.customer?.district}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-3">
            <h2 className="text-sm font-bold text-black mb-1.5">ITEMS</h2>
            
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-1.5">
              {order.lines?.map((item: any) => (
                <InvoiceLineItemMobile key={item._id} item={item} order={order} />
              ))}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto border border-gray-300 rounded">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-black border-b border-gray-300">Product</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-black border-b border-gray-300">Qty</th>
                    <th className="px-2 py-1.5 text-right font-semibold text-black border-b border-gray-300">Price</th>
                    <th className="px-2 py-1.5 text-right font-semibold text-black border-b border-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.lines?.map((item: any) => (
                    <InvoiceLineItem key={item._id} item={item} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 pt-3 mt-3">
            <div className="flex justify-end">
              <div className="w-full sm:w-56 space-y-1.5 bg-gray-50 border border-gray-200 rounded p-2.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-black">Subtotal:</span>
                  <span className="font-semibold text-black">৳{order.totals?.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-black">Shipping:</span>
                  <span className="font-semibold text-black">৳{order.totals?.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-1.5">
                  <span className="text-black">Total:</span>
                  <span className="text-green-600">৳{order.totals?.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 text-xs">
            <p className="text-black mb-0.5"><span className="font-semibold">Payment Method:</span> {order.payment?.method}</p>
            <p className="text-black"><span className="font-semibold">Payment Status:</span> <span className="font-semibold text-orange-600">{order.payment?.status}</span></p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

// Mobile card component for line items
function InvoiceLineItemMobile({ item, order }: { item: any; order: any }) {
  const qty = item.qty ?? item.quantity ?? 0;
  const productId = item.productId;

  const { data: product, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 animate-pulse rounded" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 animate-pulse rounded mb-1" />
            <div className="h-2.5 bg-gray-200 animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const title = product?.title || item.title || item.name || "Product";
  const calculatedPrice = order.totals.subTotal / order.lines.reduce((sum: number, line: any) => sum + (line.qty || line.quantity || 0), 0);
  const price = product?.price || item.price || calculatedPrice || 0;
  const image = product?.images?.[0] || product?.image || item.image;
  const lineTotal = price * qty;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-2">
      <div className="flex items-center gap-2 mb-1">
        {image ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain rounded"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-black truncate">{title}</p>
          <div className="flex justify-between items-center text-xs text-black mt-0.5">
            <span>Qty: {qty}</span>
            <span>৳{price.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="text-right border-t border-gray-200 pt-1">
        <span className="text-xs font-semibold text-black">Total: ৳{lineTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}

// Desktop table component for line items
function InvoiceLineItem({ item, order }: { item: any; order: any }) {
  const qty = item.qty ?? item.quantity ?? 0;
  const productId = item.productId;

  const { data: product, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  if (isLoading) {
    return (
      <tr className="bg-white">
        <td className="px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
          </div>
        </td>
        <td className="px-2 py-2 text-center">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-6 mx-auto" />
        </td>
        <td className="px-2 py-2 text-right">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-12 ml-auto" />
        </td>
        <td className="px-2 py-2 text-right">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-16 ml-auto" />
        </td>
      </tr>
    );
  }

  const title = product?.title || item.title || item.name || "Product";
  // Calculate price from order totals if product fetch failed
  const calculatedPrice = order.totals.subTotal / order.lines.reduce((sum: number, line: any) => sum + (line.qty || line.quantity || 0), 0);
  const price = product?.price || item.price || calculatedPrice || 0;
  const image = product?.images?.[0] || product?.image || item.image;
  const lineTotal = price * qty;

  return (
    <tr className="bg-white">
      <td className="px-2 py-2">
        <div className="flex items-center gap-2">
          {image ? (
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={image}
                alt={title}
                fill
                className="object-contain rounded"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <span className="text-xs font-medium text-black">{title}</span>
        </div>
      </td>
      <td className="px-2 py-2 text-center text-xs font-medium text-black">{qty}</td>
      <td className="px-2 py-2 text-right text-xs font-medium text-black">৳{price.toLocaleString()}</td>
      <td className="px-2 py-2 text-right text-xs font-semibold text-black">৳{lineTotal.toLocaleString()}</td>
    </tr>
  );
}
