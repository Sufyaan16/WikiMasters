"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductsGrid } from "@/components/products-grid";
import type { Product } from "@/lib/data/products";
import type { CategoryInfo } from "@/lib/data/categories";
import { cn } from "@/lib/utils";
import {
  IconSearch,
  IconX,
  IconLayoutGrid,
  IconLayoutList,
  IconSortAscending,
  IconCheck,
  IconChevronDown,
  IconSparkles,
} from "@tabler/icons-react";

interface ProductsPageClientProps {
  products: Product[];
  categories: CategoryInfo[];
}

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [value, spring, display]);

  return <span>{displayValue}</span>;
}

// Sort options
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export function ProductsPageClient({ products, categories }: ProductsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsTyping(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get active filters for tags
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; value: string }[] = [];
    if (selectedCategory !== "all") {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) filters.push({ key: "category", label: cat.name, value: selectedCategory });
    }
    if (debouncedSearchQuery.trim()) {
      filters.push({ key: "search", label: `"${debouncedSearchQuery}"`, value: debouncedSearchQuery });
    }
    return filters;
  }, [selectedCategory, debouncedSearchQuery, categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearchQuery.trim() !== "") {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.company.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price.sale || a.price.regular) - (b.price.sale || b.price.regular));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price.sale || b.price.regular) - (a.price.sale || a.price.regular));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, debouncedSearchQuery, sortBy]);

  const clearFilter = (key: string) => {
    if (key === "category") setSelectedCategory("all");
    if (key === "search") {
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Animation variants
  const headingWords = "All Products".split(" ");

  return (
    <div className="container mx-auto px-4 md:px-8 lg:px-20 py-16">
      {/* Animated Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          {headingWords.map((word, wordIndex) => (
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wordIndex * 0.15, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold"
            >
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={letterIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: wordIndex * 0.15 + letterIndex * 0.03 }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <IconSparkles className="size-8 text-primary" />
          </motion.div>
        </div>
        
        {/* Animated underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="h-1 w-32 bg-linear-to-r from-primary to-primary/50 rounded-full mb-4 origin-left"
        />
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-lg text-muted-foreground"
        >
          Explore our complete collection of cricket equipment from top brands
        </motion.p>
      </div>

      {/* Category Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 overflow-x-auto scrollbar-hide"
      >
        <div className="flex gap-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === "all"
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
            )}
          >
            {selectedCategory === "all" && (
              <motion.div
                layoutId="categoryPill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">All Categories</span>
          </motion.button>
          
          {categories.map((category) => (
            <motion.button
              key={category.slug}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.slug)}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === category.slug
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
              )}
            >
              {selectedCategory === category.slug && (
                <motion.div
                  layoutId="categoryPill"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Search and Controls Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        {/* Animated Search Bar */}
        <motion.div
          animate={{ 
            boxShadow: isSearchFocused ? "0 0 0 2px hsl(var(--primary))" : "0 0 0 0px transparent"
          }}
          transition={{ duration: 0.2 }}
          className="relative flex-1 rounded-full"
        >
          <motion.div
            animate={{ 
              scale: isTyping ? [1, 1.2, 1] : 1,
              rotate: isTyping ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            <IconSearch className="size-5" />
          </motion.div>
          <Input
            type="text"
            placeholder="Search products by name, company, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 pr-10 h-11 rounded-full border-muted-foreground/20 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("grid")}
            className={cn(
              "relative p-2 rounded-full transition-colors",
              viewMode === "grid" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {viewMode === "grid" && (
              <motion.div
                layoutId="viewToggle"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <IconLayoutGrid className="size-5 relative z-10" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("list")}
            className={cn(
              "relative p-2 rounded-full transition-colors",
              viewMode === "list" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {viewMode === "list" && (
              <motion.div
                layoutId="viewToggle"
                className="absolute inset-0 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <IconLayoutList className="size-5 relative z-10" />
          </motion.button>
        </div>

        {/* Sort Dropdown */}
        <div ref={sortRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-4 py-2 h-11 bg-muted/50 hover:bg-muted rounded-full text-sm font-medium transition-colors"
          >
            <IconSortAscending className="size-5" />
            <span className="hidden sm:inline">{sortOptions.find((o) => o.value === sortBy)?.label}</span>
            <motion.div
              animate={{ rotate: isSortOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronDown className="size-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 bg-card border rounded-xl shadow-lg overflow-hidden z-50"
              >
                {sortOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-muted transition-colors",
                      sortBy === option.value && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="w-4">
                      {sortBy === option.value && (
                        <IconCheck className="size-4 text-primary" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Active Filter Tags */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            {activeFilters.map((filter) => (
              <motion.button
                key={filter.key}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => clearFilter(filter.key)}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {filter.label}
                <IconX className="size-3" />
              </motion.button>
            ))}
            {activeFilters.length > 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear All
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Counter with Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6 flex items-center gap-2"
      >
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground"><AnimatedNumber value={filteredProducts.length} /></span> of{" "}
          <span className="font-semibold text-foreground">{products.length}</span> products
        </span>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-32 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(filteredProducts.length / products.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div key={`${selectedCategory}-${viewMode}`}>
          <ProductsGrid products={filteredProducts} viewMode={viewMode} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="mb-6"
            >
              <IconSearch className="size-16 mx-auto text-muted-foreground/50" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-2"
            >
              No products found matching your criteria
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mb-6"
            >
              Try adjusting your filters or search query
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <IconX className="size-4" />
                Clear All Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
    </div>
  );
}
