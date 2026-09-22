import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { validateImageFiles, fileToBuffer } from "@/lib/image-validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();
    const { id } = await params;

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

    const existingImagesJson = formData.getAll("existingImages") as string[];
    const existingImages = existingImagesJson.map((img) => JSON.parse(img));
    const newImages = formData.getAll("images") as File[];

    // Validate new images
    const validation = validateImageFiles(newImages);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Check for duplicate slug/sku
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { sku }],
        id: { not: id },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.slug === slug ? "Slug already exists" : "SKU already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
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

    // Handle existing images - keep only those in the list, delete others
    const existingImageIds = existingImages.map((img) => img.id);
    const imagesToDelete = await prisma.productImage.findMany({
      where: {
        productId: id,
        id: { notIn: existingImageIds },
      },
      select: { publicId: true },
    });

    // Delete removed images from Cloudinary
    for (const img of imagesToDelete) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    await prisma.productImage.deleteMany({
      where: {
        productId: id,
        id: { notIn: existingImageIds },
      },
    });

    // Update sortOrder for existing images
    for (const img of existingImages) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { sortOrder: img.sortOrder, altText: img.altText },
      });
    }

    // Upload new images to Cloudinary
    if (newImages.length > 0) {
      const maxSortOrder = await prisma.productImage.aggregate({
        where: { productId: id },
        _max: { sortOrder: true },
      });

      let sortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;
      for (const image of newImages) {
        const buffer = await fileToBuffer(image);
        
        const result = await uploadImage(buffer, {
          folder: "attari-store/products",
          public_id: `${id}-${Date.now()}-${sortOrder}`,
        });

        await prisma.productImage.create({
          data: {
            productId: id,
            url: result.url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            sortOrder: sortOrder++,
          },
        });
      }
    }

    revalidatePath("/owner/products");
    revalidatePath(`/owner/products/${id}`);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireOwner();
    const { id } = await params;

    // Get product images to delete from Cloudinary
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { publicId: true },
    });

    for (const img of images) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/owner/products");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}