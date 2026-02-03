import { Suspense } from "react";
import { WishlistPageClient } from "./wishlist-page-client";

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="container py-8">Loading wishlist...</div>}>
      <WishlistPageClient />
    </Suspense>
  );
}
