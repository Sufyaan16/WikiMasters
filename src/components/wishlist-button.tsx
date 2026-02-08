"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import { motion } from "framer-motion";

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
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [productId, user]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${productId}`);
      const data = await response.json();
      if (data.success) {
        setIsInWishlist(data.isInWishlist);
        setWishlistId(data.wishlistId);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

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

    // Optimistic update - update UI immediately
    const previousIsInWishlist = isInWishlist;
    const previousWishlistId = wishlistId;

    try {
      if (isInWishlist && wishlistId) {
        // Optimistically update UI
        setIsInWishlist(false);
        setWishlistId(null);
        window.dispatchEvent(new Event("wishlist-updated"));
        
        // Show toast immediately
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({
          title: "Removed from Wishlist",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        // Then make API call
        const response = await fetch(`/api/wishlist/${wishlistId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          // Revert on error
          setIsInWishlist(previousIsInWishlist);
          setWishlistId(previousWishlistId);
          window.dispatchEvent(new Event("wishlist-updated"));
          throw new Error(data.error || "Failed to remove from wishlist");
        }
      } else {
        // Optimistically update UI
        setIsInWishlist(true);
        
        // Show toast immediately
        const { default: Swal } = await import("sweetalert2");
        Swal.fire({
          title: "Added to Wishlist!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        // Then make API call
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (response.ok) {
          setWishlistId(data.data.id);
          window.dispatchEvent(new Event("wishlist-updated"));
        } else if (response.status === 409) {
          // Already in wishlist - keep optimistic state and fetch the existing id
          setIsInWishlist(true);
          // If server returned the existing item, use it
          if (data.data?.id) {
            setWishlistId(data.data.id);
          } else {
            // Otherwise fetch the wishlist status to get the id
            try {
              const checkResponse = await fetch(`/api/wishlist/check/${productId}`);
              const checkData = await checkResponse.json();
              if (checkData.success && checkData.wishlistId) {
                setWishlistId(checkData.wishlistId);
              }
            } catch (e) {
              console.error("Error fetching wishlist id:", e);
            }
          }
        } else {
          // Revert on error
          setIsInWishlist(previousIsInWishlist);
          throw new Error(data.error || "Failed to add to wishlist");
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
          isInWishlist ? "Remove from wishlist" : "Add to wishlist"
        }
      >
        <motion.div
          animate={
            isInWishlist
              ? {
                  scale: [1, 1.3, 1],
                }
              : {}
          }
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isInWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          />
        </motion.div>
      </Button>
    );
  }

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      className={className}
      onClick={(e) => handleToggleWishlist(e)}
    >
      <motion.div
        animate={
          isInWishlist
            ? {
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="flex items-center"
      >
        <Heart
          className={`h-4 w-4 mr-2 transition-colors ${
            isInWishlist ? "fill-current" : ""
          }`}
        />
        {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
      </motion.div>
    </Button>
  );
}
