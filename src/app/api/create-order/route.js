import { NextResponse } from "next/server";

export async function POST() {
  // Here you would call PayPal REST API with your sandbox credentials
  // For now, return a dummy orderId for testing
  const orderId = "TEST_ORDER_ID_123456";

  return NextResponse.json({ orderId });
}