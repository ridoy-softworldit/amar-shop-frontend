"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomerInfoSchema,
  CustomerInfoFormValues,
} from "@/lib/validators/orderSchema";

type Props = {
  onSubmit: (values: CustomerInfoFormValues) => void;
  defaultValues?: Partial<CustomerInfoFormValues>;
  isLoading?: boolean;
};

export default function CustomerInfoForm({
  onSubmit,
  defaultValues,
  isLoading,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(CustomerInfoSchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Full Name
        </label>
        <input
          {...register("name")}
          placeholder="Enter your full name"
          className="input"
        />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      {/* Email */}
    

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Phone
        </label>
        <input
          {...register("phone")}
          placeholder="e.g. 017xxxxxxxx"
          className="input"
        />
        {errors.phone && <p className="error">{errors.phone.message}</p>}
      </div>

      {/* House / Village */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          House / Village
        </label>
        <input
          {...register("houseOrVillage")}
          placeholder="e.g. Shantinagar"
          className="input"
        />
        {errors.houseOrVillage && (
          <p className="error">{errors.houseOrVillage.message}</p>
        )}
      </div>

      {/* Road / Post Office */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Road / Post Office
        </label>
        <input
          {...register("roadOrPostOffice")}
          placeholder="e.g. Road 12 / Banani Post Office"
          className="input"
        />
        {errors.roadOrPostOffice && (
          <p className="error">{errors.roadOrPostOffice.message}</p>
        )}
      </div>

      {/* Block / Thana */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Block / Thana
        </label>
        <input
          {...register("blockOrThana")}
          placeholder="e.g. Gulshan / Kotwali"
          className="input"
        />
        {errors.blockOrThana && (
          <p className="error">{errors.blockOrThana.message}</p>
        )}
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          District
        </label>
        <input
          {...register("district")}
          placeholder="e.g. Dhaka"
          className="input"
        />
        {errors.district && <p className="error">{errors.district.message}</p>}
      </div>

      <div className="col-span-full flex justify-end mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#167389] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#125f70] transition-all disabled:opacity-60"
        >
          {isLoading ? "Submitting..." : "Continue to Payment"}
        </button>
      </div>
    </form>
  );
}

/* Tailwind utilities for better readability */
const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#167389] focus:border-[#167389] text-gray-800";
const errorClass = "text-sm text-rose-600 mt-1 font-medium";
