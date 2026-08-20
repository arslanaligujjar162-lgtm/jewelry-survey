import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Pieces you've saved for later.",
  robots: { index: false },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
