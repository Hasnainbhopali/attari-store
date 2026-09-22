import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner();
    const { productId, quantityChange, reason, type } = await request.json();

    if (!productId || typeof quantityChange !== "number") {
      return NextResponse.json({ error: "Product ID and quantity change are required" }, { status: 400 });
    }

    const validTypes = ["IN", "OUT_SALE", "IN_RETURN", "ADJUSTMENT", "DAMAGED"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = product.stockQuantity + quantityChange;
    if (newStock < 0) {
      return NextResponse.json({ error: "Insufficient stock for this adjustment" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantityChange,
          previousStock: product.stockQuantity,
          newStock,
          reason,
          createdById: session.id,
        },
      });
    });

    revalidatePath("/owner/inventory");
    revalidatePath("/owner/products");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Adjust stock error:", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}