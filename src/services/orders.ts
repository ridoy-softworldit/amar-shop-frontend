/* src/services/orders.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ApiOk,
  CreateOrderDTO,
  OrderCreateResult,
  ApiErr,
} from "@/types/order";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
if (!API) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");

type ApiResp<T> = ApiOk<T> | ApiErr;

function buildErrorMessage(e: ApiErr | any) {
  if (!e) return "Unknown error";
  if (e?.errors?.length) {
    const lines = e.errors.map((x: any) =>
      [x.path, x.message].filter(Boolean).join(": ")
    );
    return (e.message ? e.message + " — " : "") + lines.join(" | ");
  }
  if (e?.message) return e.message;
  if (typeof e === "string") return e;
  return JSON.stringify(e).slice(0, 200);
}

function parseErrorResponse(obj: any) {
  if (!obj) return null;
  if (obj?.ok === false) {
    return obj;
  }
  if (obj?.data && obj?.data?.ok === false) {
    return obj.data;
  }
  return null;
}

/**
 * createOrder
 * - embeds idempotencyKey into body (safer across CORS preflights)
 * - logs raw response text for easier debugging
 */
export async function createOrder(
  payload: CreateOrderDTO,
  options?: { signal?: AbortSignal; idempotencyKey?: string }
): Promise<ApiOk<OrderCreateResult>> {
  const idempotencyKey =
    options?.idempotencyKey ?? (payload as any).idempotencyKey;

  // embed idempotency inside body (so we don't rely on custom headers)
  if (idempotencyKey) (payload as any).idempotencyKey = idempotencyKey;

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json",
    };

    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: options?.signal,
    });

    // DEBUG: capture raw response for troubleshooting
    const rawText = await res.text().catch(() => "");
    // print compact debug line only for errors
    if (!res.ok) {
      console.error(
        "createOrder → status:",
        res.status,
        "idempotency:",
        idempotencyKey,
        "raw:",
        rawText
      );
    }

    let json: any = {};
    try {
      json = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      json = {
        ok: false,
        message: `Non-JSON response (${res.status})`,
        raw: rawText,
      };
    }

    if (!res.ok || (json && json.ok === false)) {
      const parsedErr = parseErrorResponse(json) || {
        message: json?.message || `HTTP ${res.status}`,
      };
      const err = new Error(buildErrorMessage(parsedErr));
      (err as any).status = res.status;
      (err as any).data = parsedErr;
      (err as any).raw = rawText;
      throw err;
    }

    // on success persist phone locally (best-effort)
    try {
      if (payload.customer?.phone && typeof window !== "undefined") {
        localStorage.setItem("customer_phone", payload.customer.phone);
      }
    } catch (e) {
      console.warn("Failed to persist customer_phone locally", e);
    }

    return json as ApiOk<OrderCreateResult>;
  } catch (error: any) {
    console.error("createOrder caught:", error);
    throw error;
  }
}

// helper to create payload from cart (unchanged)
export function createOrderPayloadFromCart(
  cartItems: Array<{
    _id: string;
    quantity: number;
    price: number;
    title: string;
  }>,
  customerData: any,
  totals?: { subTotal: number; shipping: number; grandTotal: number }
): CreateOrderDTO {
  const items = cartItems.map((item) => ({
    _id: String(item._id),
    quantity: Math.max(1, Number(item.quantity || 1)),
  }));

  const calculatedTotals = totals || {
    subTotal: cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
    shipping: 0,
    grandTotal: cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
  };

  const customer: any = {
    name: customerData.name || "Guest",
    phone: customerData.phone || "",
    houseOrVillage: customerData.houseOrVillage || "",
    roadOrPostOffice: customerData.roadOrPostOffice || "",
    blockOrThana: customerData.blockOrThana || "",
    district: customerData.district || "",
  };

  // Add billing address if provided
  if (customerData.billingAddress) {
    customer.billingAddress = {
      name: customerData.billingAddress.name || "",
      phone: customerData.billingAddress.phone || "",
      houseOrVillage: customerData.billingAddress.houseOrVillage || "",
      roadOrPostOffice: customerData.billingAddress.roadOrPostOffice || "",
      blockOrThana: customerData.billingAddress.blockOrThana || "",
      district: customerData.billingAddress.district || "",
    };
  }

  return {
    items,
    customer,
    totals: calculatedTotals,
    payment: {},
    notes: "Order from website",
  };
}
