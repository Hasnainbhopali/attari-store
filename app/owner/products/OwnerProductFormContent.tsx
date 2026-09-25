"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OwnerProductFormContentProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    isFeatured: boolean;
    categoryId: string | null;
    category: { id: string; name: string } | null;
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    parentId: string | null;
    parent: { id: string; name: string } | null;
    children: Array<{ id: string; name: string }>;
    _count: { products: number };
    createdAt: Date;
    updatedAt: Date;
  }>;
  isEditing: boolean;
}

export function OwnerProductFormContent({ product, categories, isEditing }: OwnerProductFormContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; url: string; altText: string | null; sortOrder: number }>
  >(product?.images ?? []);

  const getInitialFormData = () => {
    if (product) {
      return {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description ?? "",
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
        stockQuantity: String(product.stockQuantity),
        lowStockThreshold: String(product.lowStockThreshold),
        categoryId: product.categoryId ?? "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      };
    }
    return {
      name: "",
      slug: "",
      sku: "",
      description: "",
      price: "",
      compareAtPrice: "",
      stockQuantity: "",
      lowStockThreshold: "5",
      categoryId: "",
      isActive: true,
      isFeatured: false,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remainingSlots = 10 - existingImages.length - imagePreviews.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeNewImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          formDataToSend.append(key, value ? "true" : "false");
        } else {
          formDataToSend.append(key, value);
        }
      });
      imageFiles.forEach((file) => formDataToSend.append("images", file));
      existingImages.forEach((img) => formDataToSend.append("existingImages", JSON.stringify(img)));

      const url = isEditing ? `/api/owner/products/${product?.id}` : "/api/owner/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formDataToSend });

      if (res.ok) {
        toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
        router.push("/owner/products");
      } else {
        const error = await res.json();
        toast.error(error.error ?? "Failed to save product");
      }
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
    }
  };

  const topLevelCategories = categories.filter((c) => !c.parentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update product details" : "Add a new product to your catalog"}
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting} className="ml-auto">
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter product name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="auto-generated"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Unique product code"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {topLevelCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                rows={4}
                className="mt-1"
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="compareAtPrice">Compare At Price (PKR)</Label>
                <Input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  placeholder="Original price for discount display"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Images</h2>
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Upload className="size-4" />
                Add Images
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {(existingImages.length + imagePreviews.length) > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg border bg-muted overflow-hidden">
                  {existingImages[selectedImageIndex] && (
                    <Image
                      src={existingImages[selectedImageIndex].url}
                      alt={existingImages[selectedImageIndex].altText ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  )}
                  {imagePreviews[selectedImageIndex - existingImages.length] && (
                    <img
                      src={imagePreviews[selectedImageIndex - existingImages.length]}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {(existingImages.length + imagePreviews.length) > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? existingImages.length + imagePreviews.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === existingImages.length + imagePreviews.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {existingImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 rounded-lg border-2 overflow-hidden",
                        selectedImageIndex === i ? "border-primary" : "border-transparent hover:border-muted"
                      )}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id); }}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </button>
                  ))}
                  {imagePreviews.map((preview, i) => (
                    <button
                      key={`preview-${i}`}
                      onClick={() => setSelectedImageIndex(existingImages.length + i)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 rounded-lg border-2 overflow-hidden",
                        selectedImageIndex === existingImages.length + i ? "border-primary" : "border-transparent"
                      )}
                    >
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNewImage(i); }}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(existingImages.length + imagePreviews.length) === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="mx-auto size-12 mb-2" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Status & Visibility</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Product is visible to customers</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage and featured sections</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}