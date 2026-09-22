import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categoryUpdateSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();
    const { id } = await params;

    const validation = categoryUpdateSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description, parentId, isActive } = validation.data;

    const existing = await prisma.category.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ error: "Cannot set self as parent" }, { status: 400 });
      }
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
      // Check for circular reference
      let current = parent;
      while (current.parentId) {
        if (current.parentId === id) {
          return NextResponse.json({ error: "Circular reference detected" }, { status: 400 });
        }
        const next = await prisma.category.findUnique({ where: { id: current.parentId } });
        if (!next) break;
        current = next;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/owner/categories");
    revalidatePath(`/owner/categories/${id}`);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();
    const { id } = await params;

    // Check if category has products
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Reassign or delete products first." },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await prisma.category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories. Delete subcategories first." },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/owner/categories");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}