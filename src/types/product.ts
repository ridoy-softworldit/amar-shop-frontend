import z from "zod";

// types/product.ts - এ unified type তৈরি করুন
export type AppProduct = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  status?: "ACTIVE" | "DRAFT" | "HIDDEN";
  brand?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
  images?: string[];
  compareAtPrice?: number;
  stock?: number;
  availableStock?: number;
  sku?: string;
  vendor?: string;
  createdAt?: string | Date;
  updatedAt?: Date;
};

// Zod schema update করুন
export const ZProduct = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  isDiscounted: z.boolean().optional(),
  featured: z.boolean().optional(),
  stock: z.number().optional(),
  availableStock: z.number().optional(),
  categorySlug: z.string().optional(),
  tagSlugs: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "HIDDEN"]),
  createdAt: z.string().optional(),
  description: z.string().optional().default(""),
  sku: z.string().optional(),
  vendor: z.string().optional(),
});

export type Product = z.infer<typeof ZProduct>;
