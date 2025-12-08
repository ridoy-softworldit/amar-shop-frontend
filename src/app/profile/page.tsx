/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  MapPin,
  Package,
  Sparkles,
  ChevronRight,
  LogOut,
  Edit,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ===== Types (backend shape অনুযায়ী প্রয়োজন হলে টিউন করবেন)
type OrderLine = {
  productId?: string;
  title?: string;
  price?: number;
  qty?: number;
  _id?: string;
};

type OrderTotals = {
  subTotal?: number;
  shipping?: number;
  grandTotal?: number;
};

type Order = {
  _id: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    area?: string;
  };
  lines?: OrderLine[];
  totals?: OrderTotals;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | string;
  createdAt?: string;
  updatedAt?: string;
};

// ===== Small helpers
const formatBDT = (n?: number) =>
  typeof n === "number" ? `৳${n.toFixed(2)}` : "—";

const shortId = (id: string) =>
  id?.length > 8 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "PENDING").toUpperCase();
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    CONFIRMED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    PROCESSING: "bg-blue-50 text-blue-700 ring-blue-200",
    SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    DELIVERED: "bg-green-50 text-green-700 ring-green-200",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const cls = map[s] || "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-2 ${cls}`}
    >
      {s}
    </span>
  );
}

type CustomerLocal = {
  name?: string;
  phone?: string;
  houseOrVillage?: string;
  roadOrPostOffice?: string;
  blockOrThana?: string;
  district?: string;
  address?: string;
};

// ===== Main Page
export default function ProfilePage() {
  const { user, isAuthed, isHydrated, logout } = useAuth();
  const router = useRouter();
  
  const API =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    "";

  // Local state
  const [customer, setCustomer] = useState<CustomerLocal | null>(null);
  const [phone, setPhone] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Redirect if not authenticated (only after hydration)
  useEffect(() => {
    if (isHydrated && !isAuthed) {
      router.push("/login");
    }
  }, [isAuthed, isHydrated, router]);

  // LocalStorage → customer hydrate
  useEffect(() => {
    try {
      // checkout সময়ের ডেটা যেকোন এক নামে থাকতে পারে—robust lookup
      const keys = [
        "checkout_customer",
        "order_customer",
        "customer",
        "shipping_info",
      ];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw) as CustomerLocal;
          setCustomer(parsed);
          if (parsed?.phone && !phone) setPhone(parsed.phone);
          break;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Full single-line address (UI-friendly)
  const fullAddress = useMemo(() => {
    if (!customer) return "";
    if (customer.address) return customer.address;
    const parts = [
      customer.houseOrVillage,
      customer.roadOrPostOffice,
      customer.blockOrThana,
      customer.district,
    ]
      .map((x) => x?.trim())
      .filter(Boolean);
    return parts.join(", ");
  }, [customer]);

  // Fetch orders by phone
  const loadOrders = async (ph: string) => {
    if (!API) {
      setErr("API base URL missing (NEXT_PUBLIC_API_BASE_URL).");
      return;
    }
    if (!ph || ph.trim().length < 5) {
      setErr("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setErr(null);
    setOrders([]);
    try {
      const u1 = `${API}/orders?phone=${encodeURIComponent(ph)}`;
      const res1 = await fetch(u1, {
        cache: "no-store",
        headers: { "content-type": "application/json" },
      });

      // some backends use ?customerPhone
      let data: any;
      if (res1.ok) {
        data = await res1.json();
      } else {
        const u2 = `${API}/orders?customerPhone=${encodeURIComponent(ph)}`;
        const res2 = await fetch(u2, {
          cache: "no-store",
          headers: { "content-type": "application/json" },
        });
        if (!res2.ok) {
          throw new Error(
            `Failed to load orders (${res1.status}/${res2.status})`
          );
        }
        data = await res2.json();
      }

      const arr: Order[] = Array.isArray(data?.data) ? data.data : [];
      // newest first
      arr.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      setOrders(arr);
   
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load if we already have a phone from local data
  useEffect(() => {
    if (phone) loadOrders(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!API]); // API ready হলে একবার ট্রিগার

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-[#167389]/70 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#167389] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 to-rose-100 py-20 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="text-[#167389]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#167389]">
              My Profile
            </h1>
          </div>

          {/* Link to Orders index page (exists already) */}
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border-2 border-cyan-200 text-[#167389] bg-white hover:bg-cyan-50"
          >
            Go to Orders Page <ChevronRight size={16} />
          </Link>
        </div>

        {/* Profile + Phone search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-pink-100 flex items-center justify-center">
                <User className="text-[#167389]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Account</h2>
                <p className="text-sm text-gray-600">
                  View your info and orders
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">
                    {user?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">
                    {user?.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-semibold text-gray-900 break-words">
                    {user?.address || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                href="/profile/edit"
                className="px-3 py-2 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Phone → Orders search */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900">Your Orders</h3>
            <p className="text-sm text-gray-600">
              Enter your phone number to view orders placed with it.
            </p>

            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                loadOrders(phone.trim());
              }}
            >
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 017xxxxxxxx"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-cyan-200 bg-white text-[#167389] placeholder:text-cyan-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#167389] text-white font-bold hover:brightness-110"
                disabled={loading}
              >
                {loading ? "Loading…" : "Find Orders"}
              </button>
            </form>

            {/* Error */}
            {err && (
              <div className="mt-3 text-sm text-rose-600 font-semibold">
                {err}
              </div>
            )}

            {/* Orders list */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="rounded-xl border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="mt-2 h-3 w-20 bg-gray-200 rounded" />
                    <div className="mt-4 h-20 bg-gray-100 rounded" />
                  </div>
                ))}

              {!loading && orders.length === 0 && !err && (
                <div className="col-span-full">
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-600">
                    No orders found for this phone.
                  </div>
                </div>
              )}

              {!loading &&
                orders.map((o) => {
                  const itemsCount =
                    o.lines?.reduce((s, l) => s + (l.qty || 0), 0) || 0;
                  const total = o.totals?.grandTotal ?? o.totals?.subTotal ?? 0;
                  const created = o.createdAt
                    ? new Date(o.createdAt).toLocaleString()
                    : "—";

                  return (
                    <div
                      key={o._id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Package className="text-[#167389]" />
                          <span className="font-semibold text-gray-900">
                            Order {shortId(o._id)}
                          </span>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Placed:{" "}
                          <span className="font-medium text-gray-800">
                            {created}
                          </span>
                        </p>
                        <p>
                          Items:{" "}
                          <span className="font-medium text-gray-800">
                            {itemsCount}
                          </span>
                        </p>
                        <p>
                          Total:{" "}
                          <span className="font-bold text-gray-900">
                            {formatBDT(total)}
                          </span>
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <Link
                          href={`/orders/${o._id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#167389] hover:text-rose-600"
                        >
                          View details
                          <ChevronRight size={16} />
                        </Link>

                        {/* Optional deep link to orders page filtered by phone */}
                        <Link
                          href={`/orders?phone=${encodeURIComponent(phone)}`}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          All orders with this phone
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom link to Orders page (secondary) */}
            <div className="mt-6 flex justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Go to Orders Page
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Helpful tips */}
        {/* <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-pink-50 p-4 text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              এই পেজে ফোন নম্বর দিয়ে আপনার অর্ডারগুলো দেখা যায়। Checkout সময় যে
              নম্বর দিয়েছেন সেটাই ব্যবহার করুন।
            </li>
            <li>
              প্রতিটি কার্ডে <strong>View details</strong> ক্লিক করলে{" "}
              <code>/orders/[id]</code> পেজে পুরো ডিটারেইলস পাবেন।
            </li>
            <li>
              API যদি <code>?phone=</code> না সাপোর্ট করে, কোড অটো-ফলব্যাক করে{" "}
              <code>?customerPhone=</code> ট্রাই করবে।
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
