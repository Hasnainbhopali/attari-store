import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();
    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    await prisma.payment.update({
      where: { id },
      data: { status, paidAt: status === "PAID" ? new Date() : null },
    });

    revalidatePath("/owner/orders");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}