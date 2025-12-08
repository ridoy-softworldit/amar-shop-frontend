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
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-6 sm:p-8 print-area">
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">Invoice</h1>
                <p className="text-base text-black mt-1 font-medium">Order ID: {order._id}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium no-print"
              >
                Print Invoice
              </button>
            </div>
            <div className="text-sm text-black">
              <p className="font-medium">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="font-medium">Status: <span className="font-bold text-green-600">{order.status}</span></p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3">Customer Information</h2>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-black mb-1"><span className="font-bold">Name:</span> {order.customer?.name}</p>
              <p className="text-sm text-black mb-1"><span className="font-bold">Phone:</span> {order.customer?.phone}</p>
              <p className="text-sm text-black"><span className="font-bold">Address:</span> {order.customer?.houseOrVillage}, {order.customer?.roadOrPostOffice}, {order.customer?.blockOrThana}, {order.customer?.district}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-3">Order Items</h2>
            
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-2">
              {order.lines?.map((item: any) => (
                <InvoiceLineItemMobile key={item._id} item={item} order={order} />
              ))}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto border border-gray-300 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-black uppercase border-b border-gray-300">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-black uppercase border-b border-gray-300">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-black uppercase border-b border-gray-300">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-black uppercase border-b border-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {order.lines?.map((item: any) => (
                    <InvoiceLineItem key={item._id} item={item} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-6">
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-3 bg-gray-100 border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-black">Subtotal:</span>
                  <span className="font-bold text-black">৳{order.totals?.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-black">Shipping:</span>
                  <span className="font-bold text-black">৳{order.totals?.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-gray-400 pt-3">
                  <span className="text-black">Total:</span>
                  <span className="text-green-600 text-xl">৳{order.totals?.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-black mb-1"><span className="font-bold">Payment Method:</span> {order.payment?.method}</p>
            <p className="text-sm text-black"><span className="font-bold">Payment Status:</span> <span className="font-bold text-orange-600">{order.payment?.status}</span></p>
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 animate-pulse rounded" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
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
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        {image ? (
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain rounded"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-black truncate">{title}</p>
          <div className="flex justify-between items-center text-sm text-black mt-1">
            <span>Qty: {qty}</span>
            <span>৳{price.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="text-right border-t border-gray-200 pt-2">
        <span className="text-sm font-bold text-black">Total: ৳{lineTotal.toLocaleString()}</span>
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
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-8 mx-auto" />
        </td>
        <td className="px-4 py-4 text-right">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-16 ml-auto" />
        </td>
        <td className="px-4 py-4 text-right">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-20 ml-auto" />
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
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {image ? (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={image}
                alt={title}
                fill
                className="object-contain rounded"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-300 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <span className="text-sm font-medium text-black">{title}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-center text-sm font-medium text-black">{qty}</td>
      <td className="px-4 py-4 text-right text-sm font-medium text-black">৳{price.toLocaleString()}</td>
      <td className="px-4 py-4 text-right text-sm font-bold text-black">৳{lineTotal.toLocaleString()}</td>
    </tr>
  );
}
