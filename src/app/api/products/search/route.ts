import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { sql, or, ilike, and, desc } from "drizzle-orm";

// GET search products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "12");
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brands = searchParams.get("brands"); // comma-separated
    const stockStatus = searchParams.get("stockStatus"); // in-stock, out-of-stock, all

    // Validate query parameter
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const searchTerm = `%${query.trim()}%`;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [
      or(
        ilike(products.name, searchTerm),
        ilike(products.company, searchTerm),
        ilike(products.description, searchTerm),
        ilike(products.sku, searchTerm),
        ilike(products.category, searchTerm)
      )
    ];

    // Add category filter if provided
    if (category && category !== "all") {
      conditions.push(sql`${products.category} = ${category}`);
    }

    // Add price range filter
    if (minPrice) {
      const min = parseFloat(minPrice);
      conditions.push(
        sql`COALESCE(CAST(${products.priceSale} AS DECIMAL), CAST(${products.priceRegular} AS DECIMAL)) >= ${min}`
      );
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      conditions.push(
        sql`COALESCE(CAST(${products.priceSale} AS DECIMAL), CAST(${products.priceRegular} AS DECIMAL)) <= ${max}`
      );
    }

    // Add brand filter
    if (brands && brands !== "all") {
      const brandList = brands.split(",").map(b => b.trim());
      if (brandList.length > 0) {
        conditions.push(sql`${products.company} = ANY(${brandList})`);
      }
    }

    // Add stock status filter
    if (stockStatus && stockStatus !== "all") {
      if (stockStatus === "in-stock") {
        conditions.push(
          and(
            sql`${products.trackInventory} = true`,
            sql`COALESCE(${products.stockQuantity}, 0) > 0`
          )!
        );
      } else if (stockStatus === "out-of-stock") {
        conditions.push(
          and(
            sql`${products.trackInventory} = true`,
            sql`COALESCE(${products.stockQuantity}, 0) = 0`
          )!
        );
      }
    }

    const whereClause = and(...conditions);

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    // Get search results with relevance scoring and sorting
    let orderByClause;
    
    switch (sortBy) {
      case "price-low":
        orderByClause = [
          sql`COALESCE(CAST(${products.priceSale} AS DECIMAL), CAST(${products.priceRegular} AS DECIMAL)) ASC`,
          desc(products.id)
        ];
        break;
      case "price-high":
        orderByClause = [
          sql`COALESCE(CAST(${products.priceSale} AS DECIMAL), CAST(${products.priceRegular} AS DECIMAL)) DESC`,
          desc(products.id)
        ];
        break;
      case "newest":
        orderByClause = [desc(products.id)];
        break;
      case "relevance":
      default:
        orderByClause = [
          sql`
            CASE 
              WHEN LOWER(${products.name}) = LOWER(${query.trim()}) THEN 1
              WHEN ${products.name} ILIKE ${searchTerm} THEN 2
              WHEN ${products.sku} ILIKE ${searchTerm} THEN 3
              WHEN ${products.company} ILIKE ${searchTerm} THEN 4
              ELSE 5
            END
          `,
          desc(products.id)
        ];
    }

    const searchResults = await db
      .select({
        id: products.id,
        name: products.name,
        company: products.company,
        category: products.category,
        imageSrc: products.imageSrc,
        imageAlt: products.imageAlt,
        imageHoverSrc: products.imageHoverSrc,
        imageHoverAlt: products.imageHoverAlt,
        description: products.description,
        priceRegular: products.priceRegular,
        priceSale: products.priceSale,
        priceCurrency: products.priceCurrency,
        badgeText: products.badgeText,
        badgeBackgroundColor: products.badgeBackgroundColor,
        sku: products.sku,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        trackInventory: products.trackInventory,
      })
      .from(products)
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset);

    // Transform to frontend format
    const transformedResults = searchResults.map((product) => ({
      id: product.id,
      name: product.name,
      company: product.company,
      category: product.category,
      image: {
        src: product.imageSrc,
        alt: product.imageAlt,
      },
      imageHover: product.imageHoverSrc
        ? {
            src: product.imageHoverSrc,
            alt: product.imageHoverAlt || `${product.name} - Alternate View`,
          }
        : undefined,
      description: product.description,
      price: {
        regular: parseFloat(product.priceRegular),
        sale: product.priceSale ? parseFloat(product.priceSale) : undefined,
        currency: product.priceCurrency,
      },
      badge: product.badgeText
        ? {
            text: product.badgeText,
            backgroundColor: product.badgeBackgroundColor || undefined,
          }
        : undefined,
      // Inventory Management
      sku: product.sku || undefined,
      stockQuantity: product.stockQuantity || 0,
      lowStockThreshold: product.lowStockThreshold || 10,
      trackInventory: product.trackInventory !== false,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      results: transformedResults,
      query: query.trim(),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
