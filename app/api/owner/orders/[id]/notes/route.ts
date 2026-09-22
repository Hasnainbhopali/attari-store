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
    const { adminNotes } = await request.json();

    await prisma.order.update({
      where: { id },
      data: { adminNotes },
    });

    revalidatePath(`/owner/orders/${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update admin notes error:", error);
    return NextResponse.json({ error: "Failed to update admin notes" }, { status: 500 });
  }
}