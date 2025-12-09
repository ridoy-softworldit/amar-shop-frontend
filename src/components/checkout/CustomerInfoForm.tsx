"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";

//  Validation Schema (aligned with backend DTO)
const AddressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .transform((val) => {
      // Remove +88 country code if present
      if (val.startsWith('+88')) {
        return val.substring(3);
      }
      // Remove 88 country code without + if present
      if (val.startsWith('88') && val.length === 13) {
        return val.substring(2);
      }
      // Add 0 prefix if missing (17XXXXXXXX -> 017XXXXXXXX)
      if (val.startsWith('1') && val.length === 10) {
        return '0' + val;
      }
      return val;
    })
    .refine((val) => /^01[0-9]{9}$/.test(val), {
      message: "Enter a valid Bangladeshi number (01XXXXXXXXX)"
    }),
  houseOrVillage: z.string().min(2, "Please enter your house/village"),
  roadOrPostOffice: z.string().min(2, "Please enter your road/post office"),
  blockOrThana: z.string().min(2, "Please enter your block/thana"),
  district: z.string().min(2, "Please enter your district name"),
});

const CustomerSchema = AddressSchema.extend({
  useDifferentBilling: z.boolean().optional(),
  billingAddress: z.object({
    houseOrVillage: z.string().min(2, "Please enter your house/village"),
    roadOrPostOffice: z.string().min(2, "Please enter your road/post office"),
    blockOrThana: z.string().min(2, "Please enter your block/thana"),
    district: z.string().min(2, "Please enter your district name"),
  }),
});

export type CustomerFormData = z.infer<typeof CustomerSchema>;

interface Props {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<CustomerFormData>;
}

export default function CustomerInfoForm({ onSubmit, isSubmitting, initialData }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: initialData || {},
  });



  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Resetting form with:', initialData);
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data);
      toast.success("Order submitted successfully!");
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 placeholder:text-gray-400 outline-none transition-colors 
     ${
       hasError
         ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
         : "border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
     }`;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 sm:space-y-5"
    >
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
         
          <input
            type="text"
            {...register("name")}
            placeholder="Enter your full name"
            className={inputClass(!!errors.name)}
            autoComplete="name"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.name.message}
          </p>
        )}
      </div>

     

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {/* <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
          <input
            type="tel"
            {...register("phone")}
            placeholder="01XXXXXXXXX"
            className={inputClass(!!errors.phone)}
            autoComplete="tel"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Address Fields Group */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* House/Village */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            House / Village <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("houseOrVillage")}
            placeholder="e.g. Uttara, Mirpur"
            className={inputClass(!!errors.houseOrVillage)}
          />
          {errors.houseOrVillage && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.houseOrVillage.message}
            </p>
          )}
        </div>

        {/* Road / Post Office */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Road / Post Office <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("roadOrPostOffice")}
            placeholder="e.g. Road 12, Banani Post"
            className={inputClass(!!errors.roadOrPostOffice)}
          />
          {errors.roadOrPostOffice && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.roadOrPostOffice.message}
            </p>
          )}
        </div>

        {/* Block / Thana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Block / Thana <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("blockOrThana")}
            placeholder="e.g. Block C, Dhanmondi"
            className={inputClass(!!errors.blockOrThana)}
          />
          {errors.blockOrThana && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.blockOrThana.message}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("district")}
            placeholder="e.g. Dhaka, Chattogram"
            className={inputClass(!!errors.district)}
          />
          {errors.district && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.district.message}
            </p>
          )}
        </div>
      </div>

      {/* Billing Address Checkbox */}
      <div className="border-t border-gray-200 pt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                const deliveryData = watch();
                reset({
                  ...deliveryData,
                  billingAddress: {
                    houseOrVillage: deliveryData.houseOrVillage,
                    roadOrPostOffice: deliveryData.roadOrPostOffice,
                    blockOrThana: deliveryData.blockOrThana,
                    district: deliveryData.district
                  }
                });
              }
            }}
            className="w-4 h-4 text-[#167389] border-2 border-gray-300 rounded focus:ring-[#167389] focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Same as Current Address
          </span>
        </label>
      </div>

      {/* Billing Address Fields */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-800">Billing Address</h4>
          
          {/* Billing Address Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House / Village <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("billingAddress.houseOrVillage")}
                placeholder="e.g. Uttara, Mirpur"
                className={inputClass(!!errors.billingAddress?.houseOrVillage)}
              />
              {errors.billingAddress?.houseOrVillage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.billingAddress.houseOrVillage.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Road / Post Office <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("billingAddress.roadOrPostOffice")}
                placeholder="e.g. Road 12, Banani Post"
                className={inputClass(!!errors.billingAddress?.roadOrPostOffice)}
              />
              {errors.billingAddress?.roadOrPostOffice && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.billingAddress.roadOrPostOffice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Block / Thana <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("billingAddress.blockOrThana")}
                placeholder="e.g. Block C, Dhanmondi"
                className={inputClass(!!errors.billingAddress?.blockOrThana)}
              />
              {errors.billingAddress?.blockOrThana && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.billingAddress.blockOrThana.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("billingAddress.district")}
                placeholder="e.g. Dhaka, Chattogram"
                className={inputClass(!!errors.billingAddress?.district)}
              />
              {errors.billingAddress?.district && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.billingAddress.district.message}
                </p>
              )}
            </div>
          </div>
        </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-linear-to-r from-[#167389] to-[#167389] hover:from-cyan-500 hover:to-cyan-600"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Place Order
          </>
        )}
      </motion.button>
    </form>
  );
}
