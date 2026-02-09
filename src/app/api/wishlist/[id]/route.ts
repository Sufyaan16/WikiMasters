import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { wishlists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { handleUnexpectedError, createErrorResponse, ErrorCode } from "@/lib/errors";

// DELETE - Remove product from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddress = getIpAddress(req);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) return rateLimitResult;

  const userId = authResult.userId;

  try {
    const { id } = await params;
    const wishlistId = Number.parseInt(id);

    if (Number.isNaN(wishlistId)) {
      return createErrorResponse({
        code: ErrorCode.VALIDATION_FAILED,
        message: "Invalid wishlist item ID",
      });
    }

    // Delete from wishlist (only if it belongs to the user)
    const deleted = await db
      .delete(wishlists)
      .where(and(eq(wishlists.id, wishlistId), eq(wishlists.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return createErrorResponse({
        code: ErrorCode.WISHLIST_ITEM_NOT_FOUND,
        message: "Wishlist item not found or unauthorized",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    return handleUnexpectedError(error, "DELETE /api/wishlist/[id]");
  }
}
