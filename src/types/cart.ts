
export interface CartItem {
  productId: string;
  title: string;
  brand?: string;
  manufacturer?: string;
  price: number;
  image?: string;
  quantity: number;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  orderNumber: string;
}
