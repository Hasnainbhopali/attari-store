import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrder } from "@/lib/actions/orders";
import { checkoutRateLimit } from "@/lib/rate-limiter";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkoutRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Extract idempotency key from header
  const idempotencyKey = request.headers.get("Idempotency-Key") || request.headers.get("idempotency-key");

  // Validation
  const validation = checkoutSchema.safeParse(await request.json());
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const result = await createOrder({
      ...validation.data,
      idempotencyKey: idempotencyKey || undefined,
    });

    if (result.success) {
      return NextResponse.json({ success: true, orderId: result.orderId, orderNumber: result.orderNumber });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}