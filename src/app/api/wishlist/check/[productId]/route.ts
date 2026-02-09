import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { handleUnexpectedError, createErrorResponse, ErrorCode } from "@/lib/errors";

// GET - Check if product is in user's wishlist
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  // Rate limit - moderate (60/min)
  const ipAddress = getIpAddress(req);
  const rateLimitId = getRateLimitIdentifier(undefined, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) return rateLimitResult;

  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        isInWishlist: false,
      });
    }

    const userId = user.id;
    const { productId } = await params;
    const productIdNum = Number.parseInt(productId);

    if (Number.isNaN(productIdNum)) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Invalid product ID",
      });
    }

    const wishlistItem = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.productId, productIdNum)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      isInWishlist: wishlistItem.length > 0,
      wishlistId: wishlistItem[0]?.id || null,
    });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/wishlist/check/[productId]");
  }
}
