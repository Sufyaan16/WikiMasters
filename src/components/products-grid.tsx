"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/data/products";
import { cn } from "@/lib/utils";
import { IconShoppingCart, IconStarFilled } from "@tabler/icons-react";

interface ProductsGridProps {
  products: Product[];
  viewMode?: "grid" | "list";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

function formatPrice(price: number, currency: string = "Rs") {
  return `${currency} ${price.toLocaleString()}`;
}

function ProductListCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
            <motion.img
              src={product.image.src}
              alt={product.image.alt}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            {product.badge && (
              <Badge
                className="absolute top-2 left-2"
                style={{ backgroundColor: product.badge.backgroundColor }}
              >
                {product.badge.text}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4 sm:p-6">
            <div className="flex-1">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <IconStarFilled key={i} className="size-3.5 text-yellow-400" />
                ))}
                <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
              </div>

              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{product.company}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.description}
              </p>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.price.sale ? (
                  <>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(product.price.sale, product.price.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price.regular, product.price.currency)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-lg">
                    {formatPrice(product.price.regular, product.price.currency)}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  // Add to cart logic
                }}
              >
                <IconShoppingCart className="size-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

export function ProductsGrid({ products, viewMode = "grid" }: ProductsGridProps) {
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
      )}
    >
      {products.map((product, index) => (
        <motion.div 
          key={product.id} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
        >
          {viewMode === "grid" ? (
            <ProductCard product={product} />
          ) : (
            <ProductListCard product={product} />
          )}
        </motion.div>
      ))}
    </div>
  );
}
