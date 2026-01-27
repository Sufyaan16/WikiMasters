import { notFound } from "next/navigation";
import db from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OrderDetail } from "./order-detail";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  // Fetch order from database
  const dbOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .limit(1);

  if (!dbOrder || dbOrder.length === 0) {
    notFound();
  }

  return <OrderDetail order={dbOrder[0]} />;
}
