import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

/**
 * GET /api/orders/my-orders
 * Fetch orders for the currently authenticated user
 */
export async function GET(request: NextRequest) {
  // Protect route - authenticated users only
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min for viewing own orders)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    // Get user's email from auth
    const user = authResult.user;
    if (!user?.primaryEmail) {
      return createErrorResponse({
        code: ErrorCode.USER_NOT_FOUND,
        message: "User email not found",
      });
    }

    // Fetch orders for this user's email
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, user.primaryEmail))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      orders: userOrders,
      count: userOrders.length,
    });
  } catch (error) {
    return handleUnexpectedError(error, "GET /api/orders/my-orders");
  }
}
