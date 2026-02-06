import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/order";
import { resend } from "@/lib/resend";
import OrderConfirmationEmail from "@/emails/order-confirmation";
import { requireAuth, requireAdmin } from "@/lib/auth-helpers";
import { checkRateLimit, getRateLimitIdentifier, getIpAddress } from "@/lib/rate-limit";
import { calculateOrderPrices } from "@/lib/price-calculator";

// GET all orders
export async function GET(request: Request) {
  // Protect route - admin only (viewing all orders)
  const authResult = await requireAdmin();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - moderate (60/min for admins)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "moderate");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST new order
export async function POST(request: Request) {
  // Protect route - authenticated users can create orders
  const authResult = await requireAuth();
  if (!authResult.success) {
    return authResult.error;
  }

  // Rate limit - strict (10/min for creating orders)
  const ipAddress = getIpAddress(request);
  const rateLimitId = getRateLimitIdentifier(authResult.userId, ipAddress);
  const rateLimitResult = await checkRateLimit(rateLimitId, "strict");
  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const body = await request.json();

    // Validate request body shape
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // ========================================
    // SERVER-SIDE PRICE RECALCULATION
    // NEVER trust client-provided prices!
    // ========================================
    const orderItems = validatedData.items.map(item => ({
      productId: item.productId!,
      quantity: item.quantity,
    }));

    const priceCalculation = await calculateOrderPrices(
      orderItems,
      0.08, // 8% tax rate - adjust based on your needs
      validatedData.shippingCost
    );

    // Check if calculation failed
    if ("error" in priceCalculation) {
      return NextResponse.json(
        {
          error: priceCalculation.error,
          details: priceCalculation.details,
        },
        { status: 400 }
      );
    }

    // Log price discrepancy for fraud detection
    const clientTotal = validatedData.total;
    const serverTotal = priceCalculation.total;
    if (Math.abs(clientTotal - serverTotal) > 0.01) {
      console.warn(
        "⚠️ Price mismatch detected!",
        {
          userId: authResult.userId,
          clientTotal,
          serverTotal,
          difference: clientTotal - serverTotal,
        }
      );
    }

    // Use SERVER-CALCULATED prices, not client prices
    const finalOrderData = {
      ...validatedData,
      items: priceCalculation.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal: priceCalculation.subtotal,
      tax: priceCalculation.tax,
      shippingCost: priceCalculation.shippingCost,
      total: priceCalculation.total,
    };

    // Check for order number uniqueness
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, validatedData.orderNumber))
      .limit(1);

    if (existingOrder.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: { orderNumber: ["Order number already exists"] },
        },
        { status: 400 }
      );
    }

    try {
      const newOrder = await db
        .insert(orders)
        .values({
          ...finalOrderData,
          subtotal: finalOrderData.subtotal.toString(),
          tax: finalOrderData.tax.toString(),
          shippingCost: finalOrderData.shippingCost.toString(),
          total: finalOrderData.total.toString(),
        })
        .returning();

      // Deduct stock for each item
      for (const item of finalOrderData.items) {
        if (item.productId) {
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (product && product.trackInventory) {
            const newStockQuantity = (product.stockQuantity || 0) - item.quantity;
            await db
              .update(products)
              .set({ stockQuantity: Math.max(0, newStockQuantity) })
              .where(eq(products.id, item.productId));
          }
        }
      }

      // Send order confirmation email
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'orders@yourdomain.com',
          to: validatedData.customerEmail,
          subject: `Order Confirmation - ${validatedData.orderNumber}`,
          react: OrderConfirmationEmail({
            customerName: validatedData.customerName,
            orderNumber: validatedData.orderNumber,
            orderDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            items: finalOrderData.items.map((item) => ({
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
            subtotal: finalOrderData.subtotal,
            tax: finalOrderData.tax,
            shippingCost: finalOrderData.shippingCost,
            total: finalOrderData.total,
            shippingAddress: validatedData.shippingAddress,
            shippingCity: validatedData.shippingCity,
            shippingState: validatedData.shippingState,
            shippingZip: validatedData.shippingZip,
          }),
        });
        console.log('✅ Order confirmation email sent to:', validatedData.customerEmail);
      } catch (emailError) {
        // Log email error but don't fail the order creation
        console.error('❌ Failed to send order confirmation email:', emailError);
      }

      return NextResponse.json(newOrder[0], { status: 201 });
    } catch (insertError: any) {
      // Handle database unique constraint violation for orderNumber
      if (insertError?.code === '23505' || insertError?.constraint?.includes('order_number')) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: { orderNumber: ["Order number already exists"] },
          },
          { status: 400 }
        );
      }
      throw insertError;
    }
  } catch (error) {
    console.error("Error creating order:", error);
    
    // Check if it's a Zod error that somehow wasn't caught
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
