import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { products } from "@/db/schema";
import { sql, or, ilike, and, desc } from "drizzle-orm";

// GET search products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");

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
    const searchConditions = or(
      ilike(products.name, searchTerm),
      ilike(products.company, searchTerm),
      ilike(products.description, searchTerm),
      ilike(products.sku, searchTerm),
      ilike(products.category, searchTerm)
    );

    // Add category filter if provided
    const whereClause = category
      ? and(searchConditions, sql`${products.category} = ${category}`)
      : searchConditions;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    // Get search results with relevance scoring
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
        // Relevance score: lower is better (1 = exact name match, 5 = description match)
        relevance: sql<number>`
          CASE 
            WHEN LOWER(${products.name}) = LOWER(${query.trim()}) THEN 1
            WHEN ${products.name} ILIKE ${searchTerm} THEN 2
            WHEN ${products.sku} ILIKE ${searchTerm} THEN 3
            WHEN ${products.company} ILIKE ${searchTerm} THEN 4
            ELSE 5
          END
        `.as('relevance'),
      })
      .from(products)
      .where(whereClause)
      .orderBy(sql`relevance ASC`, desc(products.id))
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
