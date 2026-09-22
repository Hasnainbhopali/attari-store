import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { items: true },
      });
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stockQuantity: true, isActive: true },
      });

      if (!product || !product.isActive) {
        continue;
      }

      const existingItem = cart.items.find((ci) => ci.productId === item.productId);
      const totalQuantity = (existingItem?.quantity ?? 0) + item.quantity;
      const finalQuantity = Math.min(totalQuantity, product.stockQuantity);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: finalQuantity },
        });
      } else if (finalQuantity > 0) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: finalQuantity,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Merge guest cart error:", error);
    return NextResponse.json({ error: "Failed to merge cart" }, { status: 500 });
  }
}