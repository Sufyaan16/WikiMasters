"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import { useWishlist } from "@/contexts/wishlist-context";

interface WishlistButtonProps {
  productId: number;
  variant?: "default" | "icon";
  className?: string;
}

export function WishlistButton({
  productId,
  variant = "default",
  className = "",
}: WishlistButtonProps) {
  const user = useUser();
  const { isInWishlist, getWishlistId, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(productId);
  const wishlistId = getWishlistId(productId);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    // Prevent triggering parent link navigation
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Sign in required",
        text: "Please sign in to add products to your wishlist",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      if (inWishlist && wishlistId) {
        // Remove from wishlist
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({
          title: "Removed from Wishlist",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        const success = await removeFromWishlist(wishlistId);
        
        if (!success) {
          throw new Error("Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({
          title: "Added to Wishlist!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        const newWishlistId = await addToWishlist(productId);
        
        if (!newWishlistId) {
          throw new Error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      const { default: Swal } = await import("sweetalert2");
      Swal.fire({
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update wishlist",
        icon: "error",
        confirmButtonText: "OK",
        toast: true,
        position: "top-end",
        timer: 2000,
      });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`hover:bg-transparent ${className}`}
        onClick={(e) => handleToggleWishlist(e)}
        aria-label={
          inWishlist ? "Remove from wishlist" : "Add to wishlist"
        }
      >
        <div
          className={`transition-transform ${
            inWishlist ? "animate-in zoom-in-110" : ""
          }`}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              inWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          />
        </div>
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "default" : "outline"}
      className={className}
      onClick={(e) => handleToggleWishlist(e)}
    >
      <div
        className={`flex items-center transition-transform ${
          inWishlist ? "animate-in zoom-in-110" : ""
        }`}
      >
        <Heart
          className={`h-4 w-4 mr-2 transition-colors ${
            inWishlist ? "fill-current" : ""
          }`}
        />
        {inWishlist ? "In Wishlist" : "Add to Wishlist"}
      </div>
    </Button>
  );
}
