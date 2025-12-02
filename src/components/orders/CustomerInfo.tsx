"use client";

import type { Order } from "@/types/order";

export default function CustomerInfo({ order }: { order: Order }) {
  const info = order.customer;

  return (
    <div className="mb-6">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
        🧍 Customer Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {[
          ["Name", info.name],
      
          ["Phone", info.phone],
          ["House / Village", info.houseOrVillage],
          ["Road / Post Office", info.roadOrPostOffice],
          ["Block / Thana", info.blockOrThana],
          ["District", info.district],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-white p-4 rounded-xl border border-pink-100 shadow-sm"
          >
            <span className="text-gray-600 font-medium">{label}:</span>
            <p className="font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
