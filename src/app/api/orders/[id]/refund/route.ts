import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import {
  createErrorResponse,
  createSuccessResponse,
  handleZodError,
  handleUnexpectedError,
  ErrorCode,
} from "@/lib/errors";

// Refund request schema
const refundSchema = z.object({
  reason: z.string().min(10, "Refund reason must be at least 10 characters").max(500),
  refundAmount: z.number().positive().optional(), // If not provided, refund full amount
  restoreInventory: z.boolean().default(true), // Whether to restore product inventory
});

/**
 * POST /api/orders/[id]/refund
 * Process a refund for an order (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route - admin only
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for mutations)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const { id } = await params;
    const orderId = Number(id);

    if (isNaN(orderId)) {
      return createErrorResponse({
        code: ErrorCode.INVALID_ORDER_ID,
        message: "Invalid order ID",
      });
    }

    const body = await request.json();

    // Validate request body
    const validation = refundSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }

    const { reason, refundAmount, restoreInventory } = validation.data;

    // Get the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: "Order not found",
      });
    }

    // Check if order can be refunded
    if (order.paymentStatus === "refunded") {
      return createErrorResponse({
        code: ErrorCode.ORDER_ALREADY_REFUNDED,
        message: "Order has already been refunded",
      });
    }

    if (order.paymentStatus !== "paid") {
      return createErrorResponse({
        code: ErrorCode.ORDER_NOT_PAID,
        message: `Order cannot be refunded. Payment status: ${order.paymentStatus}`,
        details: {
          paymentStatus: order.paymentStatus,
          reason: "Only paid orders can be refunded",
        },
      });
    }

    // Validate refund amount
    const orderTotal = parseFloat(order.total);
    const actualRefundAmount = refundAmount || orderTotal;

    if (actualRefundAmount > orderTotal) {
      return createErrorResponse({
        code: ErrorCode.INVALID_REFUND_AMOUNT,
        message: "Refund amount cannot exceed order total",
        details: {
          requestedAmount: actualRefundAmount,
          orderTotal: orderTotal,
        },
      });
    }

    // Restore inventory if requested
    if (restoreInventory) {
      const orderItems = order.items as Array<{
        productId: number;
        quantity: number;
      }>;

      for (const item of orderItems) {
        // Get product to check if inventory tracking is enabled
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product && product.trackInventory) {
          // Restore the stock
          await db
            .update(products)
            .set({
              stockQuantity: (product.stockQuantity || 0) + item.quantity,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(products.id, item.productId));
        }
      }
    }

    // Update order status to refunded
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: "refunded",
        paymentStatus: "refunded",
        notes: order.notes
          ? `${order.notes}\n\n[REFUND] ${reason} (Amount: ${actualRefundAmount} ${order.currency})`
          : `[REFUND] ${reason} (Amount: ${actualRefundAmount} ${order.currency})`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // TODO: Integration with payment gateway (Stripe, PayPal, etc.) for actual refund processing
    // For now, we're just updating the database status

    return createSuccessResponse(
      {
        order: updatedOrder,
        refundAmount: actualRefundAmount,
        currency: order.currency,
        inventoryRestored: restoreInventory,
        message: "Refund processed successfully",
        note: "Payment gateway integration pending - manual refund may be required",
      },
       { message: "Refund processed successfully" }
    );
  } catch (error) {
    return handleUnexpectedError(error, "POST /api/orders/[id]/refund");
  }
}
