"use client";

import type { Order } from "@/types/order";

export default function CustomerInfo({ order }: { order: Order }) {
  const info = order.customer;

  return (
    <div className="mb-4 bg-white p-3 rounded border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Customer Information</h4>
      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">Name:</span> {info.name}</p>
        <p><span className="font-medium">Phone:</span> {info.phone}</p>
        <p><span className="font-medium">Address:</span> {info.houseOrVillage}, {info.roadOrPostOffice}, {info.blockOrThana}, {info.district}</p>
      </div>
    </div>
  );
}
