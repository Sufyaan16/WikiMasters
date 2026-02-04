"use client";

import { useEffect, useState, useMemo } from "react";
import { Product } from "@/lib/data/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, ArrowUpDown } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import Swal from "sweetalert2";
import { WishlistLoadingSkeleton } from "./wishlist-loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistItem {
  id: number;
  productId: number;
  addedAt: string;
  notes: string | null;
  product: Product;
}

export function WishlistPageClient() {
  const user = useUser();
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchWishlist();
  }, [user, router]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setWishlistItems(data.data);
      } else {
        Swal.fire({
          title: "Error",
          text: data.error || "Failed to load wishlist",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to load wishlist",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveFromWishlist = async (wishlistId: number, options?: { suppressToast?: boolean }) => {
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.id !== wishlistId)
        );
        // Dispatch custom event to update wishlist count
        window.dispatchEvent(new Event("wishlist-updated"));
        if (!options?.suppressToast) {
          Swal.fire({
            title: "Removed!",
            text: "Product removed from wishlist",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      if (!options?.suppressToast) {
        Swal.fire({
          title: "Error",
          text: "Failed to remove from wishlist",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      return false;
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    const isOutOfStock =
      item.product.trackInventory &&
      (item.product.stockQuantity || 0) === 0;

    if (isOutOfStock) {
      Swal.fire({
        title: "Out of Stock",
        text: "Sorry, this product is currently unavailable.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
      return;
    }

    // Remove from wishlist first (silently)
    const removed = await handleRemoveFromWishlist(item.id, { suppressToast: true });
    
    if (removed) {
      // Only add to cart if removal succeeded
      addToCart(item.product);
      Swal.fire({
        title: "Moved to Cart!",
        text: `${item.product.name} has been added to your cart.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Failed to move item to cart",
        icon: "error",
        confirmButtonText: "OK",
        toast: true,
        position: "top-end",
      });
    }
  };

  // Get unique categories from wishlist items
  const categories = useMemo(() => {
    const cats = new Set(wishlistItems.map((item) => item.product.category));
    return Array.from(cats);
  }, [wishlistItems]);

  // Sort and filter wishlist items
  const filteredAndSortedItems = useMemo(() => {
    let items = [...wishlistItems];

    // Apply category filter
    if (filterCategory !== "all") {
      items = items.filter((item) => item.product.category === filterCategory);
    }

    // Apply stock filter
    items = items.filter((item) => {
      const isOutOfStock =
        item.product.trackInventory &&
        (item.product.stockQuantity || 0) === 0;
      if (isOutOfStock) return showOutOfStock;
      return showInStock;
    });

    // Apply sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "date-asc":
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case "price-low":
          return (
            (a.product.price.sale || a.product.price.regular) -
            (b.product.price.sale || b.product.price.regular)
          );
        case "price-high":
          return (
            (b.product.price.sale || b.product.price.regular) -
            (a.product.price.sale || a.product.price.regular)
          );
        case "name-asc":
          return a.product.name.localeCompare(b.product.name);
        case "name-desc":
          return b.product.name.localeCompare(a.product.name);
        default:
          return 0;
      }
    });

    return items;
  }, [wishlistItems, sortBy, filterCategory, showInStock, showOutOfStock]);

  if (isLoading) {
    return <WishlistLoadingSkeleton />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container py-16">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="rounded-full bg-muted p-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground max-w-md">
              Start adding products to your wishlist by clicking the heart icon
              on any product
            </p>
          </div>
          <Button onClick={() => router.push("/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {filteredAndSortedItems.length} of {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-6 p-4 bg-muted/50 rounded-lg">
        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stock Filter */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Stock:</Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={showInStock}
              onCheckedChange={(checked) => setShowInStock(checked === true)}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock
            </Label>
          </div>
          <div className="flex items-center gap-2 ">
            <Checkbox
              id="out-of-stock"
              checked={showOutOfStock}
              onCheckedChange={(checked) => setShowOutOfStock(checked === true)}
            />
            <Label htmlFor="out-of-stock" className="text-sm cursor-pointer">
              Out of Stock
            </Label>
          </div>
        </div>
      </div>

      {/* Grid with Animations */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No items match your filters. Try adjusting your selection.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mx-auto max-w-screen-2xl"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className="relative group"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={item.product} />
                </motion.div>

                {/* Action Buttons Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 pointer-events-none"
                >
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMoveToCart(item);
                    }}
                    className="pointer-events-auto"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFromWishlist(item.id);
                    }}
                    className="pointer-events-auto"
                  >
                    Remove
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
