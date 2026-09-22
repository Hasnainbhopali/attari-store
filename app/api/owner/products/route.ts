import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/cloudinary";
import { validateImageFiles, fileToBuffer } from "@/lib/image-validation";

export async function POST(request: NextRequest) {
  try {
    await requireOwner();

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null;
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const lowStockThreshold = parseInt(formData.get("lowStockThreshold") as string);
    const categoryId = formData.get("categoryId") as string || null;
    const isActive = formData.get("isActive") === "true";
    const isFeatured = formData.get("isFeatured") === "true";

    const newImages = formData.getAll("images") as File[];

    // Validate images
    const validation = validateImageFiles(newImages);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check for duplicate slug/sku
    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.slug === slug ? "Slug already exists" : "SKU already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        price,
        compareAtPrice,
        stockQuantity,
        lowStockThreshold,
        categoryId,
        isActive,
        isFeatured,
      },
    });

    // Upload images to Cloudinary
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const buffer = await fileToBuffer(image);
        
        const result = await uploadImage(buffer, {
          folder: "attari-store/products",
          public_id: `${product.id}-${Date.now()}-${i}`,
        });

        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: result.url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            sortOrder: i,
          },
        });
      }
    }

    revalidatePath("/owner/products");
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}