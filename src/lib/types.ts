export type CategorySlug = "earrings" | "rings" | "bracelets" | "necklaces";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string | null;
}

/** A colourway of a product, shown by one of the product's own photos. */
export interface ColourOption {
  name: string;
  image: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  category?: Category;
  price: number;
  compare_at_price: number | null;
  description: string;
  plating_spec: string;
  material_spec: string;
  images: string[];
  stock_count: number;
  is_new: boolean;
  ring_size_range: string | null;
  /** Null/empty when the piece comes in one colour. Stock is shared across colours. */
  colour_options?: ColourOption[] | null;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "returned"
  | "cancelled";

export interface OrderItem {
  product_id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  ring_size?: string | null;
  colour?: string | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  province: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  promo_code: string | null;
  payment_method: "cod" | "gateway";
  payment_status: "pending" | "paid" | "failed";
  status: OrderStatus;
  otp_verified: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at: string | null;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_number: string;
  reason: string;
  status: "requested" | "approved" | "rejected" | "picked_up" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface CartLine {
  product_id: string;
  sku: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  ring_size?: string | null;
  colour?: string | null;
  max_stock: number;
}
