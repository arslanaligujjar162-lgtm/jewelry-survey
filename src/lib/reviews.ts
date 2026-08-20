import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Review[];
}

export function getReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}

export interface SubmitReviewInput {
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
}

export interface SubmitReviewResult {
  success: boolean;
  error?: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  if (!input.authorName.trim() || !input.comment.trim()) {
    return { success: false, error: "Name and review text are required" };
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }

  if (!isSupabaseConfigured()) {
    console.log(`[reviews:stub] would record review for product ${input.productId}`, input);
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("reviews").insert({
    product_id: input.productId,
    author_name: input.authorName.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
    status: "pending",
  });

  if (error) return { success: false, error: "Could not submit your review. Please try again." };
  return { success: true };
}
