"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Phone, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { toast } from "react-hot-toast";

interface ProductActionsProps {
  product: Product;
  hotline: string;
}

export default function ProductActions({
  product,
  hotline,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Cart store methods
  const { addItem, items } = useCartStore();

  // Check if product is already in cart
  const existingCartItem = items.find((item) => item._id === product._id);
  const isInCart = !!existingCartItem;

  // Stock validation
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const availableStock = product.stock ?? 0;
  const _canIncrease = quantity < availableStock;

  // Add to Bag handler - User can add only once
  const handleAddToCart = async () => {
    if (isInCart) {
      toast.error("This product is already in your cart");
      return;
    }

    if (isOutOfStock) {
      toast.error("Sorry, this product is out of stock");
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    setIsAdding(true);

    try {
      addItem({
        _id: product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.image,
        quantity: quantity,
      });

      toast.success(`Added ${quantity} item(s) to cart successfully!`);
    } catch (_error) {
      toast.error("Failed to add product to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // Buy now handler
  const handleBuyNow = async () => {
    if (isInCart) {
      toast.success("Product already in cart. Redirecting to checkout...");
      setTimeout(() => router.push("/checkout"), 1000);
      return;
    }

    if (isOutOfStock) {
      toast.error("Sorry, this product is out of stock");
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    await handleAddToCart();
    setTimeout(() => router.push("/checkout"), 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Stock Info with Beauty Theme */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#F5FDF8] to-[#F5FDF8] rounded-xl border-2 border-pink-200 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <p className="text-sm sm:text-base font-medium text-center">
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : availableStock < 10 ? (
              <span className="text-orange-600 font-semibold">
                Hurry! Only {availableStock} left
              </span>
            ) : (
              <span className="text-pink-600 font-semibold">
                Available in Stock
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isInCart || isAdding}
          className="flex-1 inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-[#167389] to-[#167389] text-white font-semibold rounded-xl  hover:from-cyan-200 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] text-sm sm:text-base"
        >
          {isAdding ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5" />
          )}
          <span className="font-semibold">
            {isAdding
              ? "Adding..."
              : isInCart
                ? "Already in Cart"
                : "Add to Bag"}
          </span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding}
          className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] text-sm sm:text-base"
        >
          <Zap className="w-5 h-5 sm:w-5 sm:h-5" />
          <span className="font-semibold">Order Now</span>
        </button>
      </div>

      {/* Hotline Section with Beauty Theme */}
      <div className="pt-4 sm:pt-5 border-t-2 border-pink-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
          <p className="text-xs sm:text-sm text-gray-600 font-medium px-2">
            Or Order by Phone
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
        </div>

        <a
          href={`tel:${hotline}`}
          className="inline-flex items-center justify-center gap-2 sm:gap-2.5 w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 text-pink-700 font-semibold rounded-xl hover:from-pink-100 hover:to-rose-100 hover:border-pink-400 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
        >
          <Phone className="w-5 h-5 sm:w-5 sm:h-5" />
          <span className="font-semibold">Call {hotline}</span>
        </a>

        <p className="text-xs sm:text-sm text-center text-gray-500 mt-2 sm:mt-3">
          Available 9 AM - 9 PM Daily
        </p>
      </div>

      {/* Trust Badge */}
      <div className="pt-3 sm:pt-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
            <span className="font-medium">100% Authentic</span>
          </div>
          <span className="text-pink-300">•</span>
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
