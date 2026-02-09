import { NextRequest, NextResponse } from "next/server";
import  db  from "@/db";
import { carts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { z } from "zod";
import {
  updateCartSchema,
  updateCartItemSchema,
  MAX_CART_ITEMS,
  MAX_ITEM_QUANTITY,
} from "@/lib/validations/cart";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { handleUnexpectedError, handleZodError, createErrorResponse, ErrorCode } from "@/lib/errors";
// GET /api/cart - Get user's cart
export async function GET(request: Request) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, authResult.userId))
      .limit(1);

    if (userCart.length === 0) {
      // Create empty cart for user
      const [newCart] = await db
        .insert(carts)
        .values({ userId: authResult.userId, items: [] })
        .returning();
      
      return NextResponse.json(newCart);
    }

    return NextResponse.json(userCart[0]);
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/cart");
  }
}

// POST /api/cart - Update entire cart (for merging guest cart)
export async function POST(request: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddressPost = getIpAddress(request);
  const rateLimitIdPost = getRateLimitIdentifier(authResult.userId, ipAddressPost);
  const rateLimitResultPost = await checkRateLimit(rateLimitIdPost, "strict");
  if (rateLimitResultPost) return rateLimitResultPost;

  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = updateCartSchema.safeParse(body);
    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const { items } = validationResult.data;

    // Check if cart exists
    const existingCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, authResult.userId))
      .limit(1);

    if (existingCart.length === 0) {
      // Create new cart
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: authResult.userId,
          items: items || [],
        })
        .returning();
      
      return NextResponse.json(newCart);
    }

    // Update existing cart
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: items || [],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, authResult.userId))
      .returning();

    return NextResponse.json(updatedCart);
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/cart");
  }
}

// PUT /api/cart - Add/update item in cart
export async function PUT(request: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddressPut = getIpAddress(request);
  const rateLimitIdPut = getRateLimitIdentifier(authResult.userId, ipAddressPut);
  const rateLimitResultPut = await checkRateLimit(rateLimitIdPut, "strict");
  if (rateLimitResultPut) return rateLimitResultPut;

  try {
    const { productId, quantity } = await request.json();

    // Validate request body
    const validationResult = updateCartItemSchema.safeParse({ productId, quantity });
    if (!validationResult.success) {
      return handleZodError(validationResult.error);
    }

    const validatedData = validationResult.data;

    // Get current cart
    const existingCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, authResult.userId))
      .limit(1);

    let currentItems = existingCart.length > 0 ? existingCart[0].items : [];

    // Update or add item
    const itemIndex = currentItems.findIndex((item: any) => item.productId === validatedData.productId);
    
    if (validatedData.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      currentItems = currentItems.filter((item: any) => item.productId !== validatedData.productId);
    } else if (itemIndex >= 0) {
      // Update existing item
      currentItems[itemIndex] = { productId: validatedData.productId, quantity: validatedData.quantity };
    } else {
      // Add new item - check cart item limit
      if (currentItems.length >= MAX_CART_ITEMS) {
        return createErrorResponse({
          code: ErrorCode.VALIDATION_FAILED,
          message: `Cart cannot contain more than ${MAX_CART_ITEMS} items`,
        });
      }
      currentItems.push({ productId: validatedData.productId, quantity: validatedData.quantity });
    }

    if (existingCart.length === 0) {
      // Create new cart
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: authResult.userId,
          items: currentItems,
        })
        .returning();
      
      return NextResponse.json(newCart);
    }

    // Update existing cart
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: currentItems,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, authResult.userId))
      .returning();

    return NextResponse.json(updatedCart);
  } catch (error) {
    return handleUnexpectedError(error, "PUT /api/cart");
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddressDel = getIpAddress(request);
  const rateLimitIdDel = getRateLimitIdentifier(authResult.userId, ipAddressDel);
  const rateLimitResultDel = await checkRateLimit(rateLimitIdDel, "strict");
  if (rateLimitResultDel) return rateLimitResultDel;

  try {
    const [updatedCart] = await db
      .update(carts)
      .set({
        items: [],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(carts.userId, authResult.userId))
      .returning();

    if (!updatedCart) {
      return createErrorResponse({
        code: ErrorCode.CART_NOT_FOUND,
        message: "Cart not found",
      });
    }

    return NextResponse.json(updatedCart);
  } catch (error) {
    return handleUnexpectedError(error, "DELETE /api/cart");
  }
}
