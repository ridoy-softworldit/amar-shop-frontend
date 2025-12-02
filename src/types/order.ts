/* eslint-disable @typescript-eslint/no-explicit-any */


export interface CreateOrderDTO {
  items: Array<{
    _id: string;
    quantity: number;
  }>;
  customer: {
    name: string;
    phone: string;
    houseOrVillage?: string;
    roadOrPostOffice?: string;
    blockOrThana?: string;
    district?: string;
  };
  totals?: {
    subTotal: number;
    shipping: number;
    grandTotal: number;
  };
  payment?: any;
  notes?: string;
}

export interface OrderCreateResult {
  ok: boolean;
  orderId?: string;
  message?: string;
  updatedProducts?: Array<{ _id: string; stock: number }>;
  timestamp?: string;
}

export interface ApiOk<T = unknown> {
  ok: true;
  data?: T;
  message?: string;
}

// Error types
export interface ApiErrItem {
  path?: string;
  message?: string;
  code?: string;
}

export interface ApiErr {
  ok: false;
  code?: string;
  message?: string;
  errors?: ApiErrItem[];
}

// ✅ ADD: Order and OrderStatus types
export type OrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "IN_SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderLine {
  // canonical id (product reference)
  productId?: string;
  // both fields accepted (some payloads use `quantity`, others `qty`)
  quantity?: number;
  qty: number; // keep non-optional to satisfy UI that expects a numeric qty
  // pricing / display fields
  price?: number;
  name?: string;
  title?: string;
  image?: string;
  // legacy / flexible fields
  // allow arbitrary extra properties without breaking compile
  [k: string]: any;
}

export interface OrderTotals {
  subTotal: number;
  shipping: number;
  grandTotal: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  houseOrVillage?: string;
  roadOrPostOffice?: string;
  blockOrThana?: string;
  district?: string;
}

export interface Order {
  _id: string;
  customer: OrderCustomer;
  lines: OrderLine[];
  totals: OrderTotals;
  status: OrderStatus;
  payment?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
}

// ✅ ADD: For order listing responses
export interface OrdersResponse {
  ok: boolean;
  data?: {
    items: Order[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

// ✅ ADD: Invoice types
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  pdfUrl?: string;
  guestToken?: string;
  status: "GENERATED" | "PENDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
}
