"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@stackframe/stack";

interface WishlistItem {
  id: number;
  productId: number;
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: number) => boolean;
  getWishlistId: (productId: number) => number | null;
  addToWishlist: (productId: number) => Promise<number | null>;
  removeFromWishlist: (wishlistId: number) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setWishlistItems(data.data.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          addedAt: item.addedAt,
        })));
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  const getWishlistId = useCallback((productId: number) => {
    const item = wishlistItems.find(item => item.productId === productId);
    return item?.id ?? null;
  }, [wishlistItems]);

  const addToWishlist = async (productId: number): Promise<number | null> => {
    if (!user) return null;

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok || response.status === 409) {
        const wishlistId = data.data?.id;
        
        // Optimistically update local state
        if (!isInWishlist(productId)) {
          setWishlistItems(prev => [...prev, {
            id: wishlistId,
            productId,
            addedAt: new Date().toISOString(),
          }]);
        }
        
        window.dispatchEvent(new Event("wishlist-updated"));
        return wishlistId;
      }

      return null;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return null;
    }
  };

  const removeFromWishlist = async (wishlistId: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Optimistically update local state
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
        window.dispatchEvent(new Event("wishlist-updated"));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return false;
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        isInWishlist,
        getWishlistId,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
