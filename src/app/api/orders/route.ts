import { NextResponse } from "next/server";
import db from "@/db/index";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all orders
export async function GET() {
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
  try {
    const body = await request.json();

    const newOrder = await db
      .insert(orders)
      .values(body)
      .returning();

    return NextResponse.json(newOrder[0], { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
