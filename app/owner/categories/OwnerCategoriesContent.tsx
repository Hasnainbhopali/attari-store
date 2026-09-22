"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ChevronRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children: Omit<CategoryWithChildren, 'parent'>[];
  _count: { products: number };
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryWithLevel extends CategoryWithChildren {
  _level: number;
}

interface OwnerCategoriesContentProps {
  categories: CategoryWithChildren[];
}

export function OwnerCategoriesContent({ categories }: OwnerCategoriesContentProps) {
  const router = useRouter();
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    isActive: true,
  });
  const [editCategory, setEditCategory] = useState<CategoryWithChildren | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const topLevelCategories = categories.filter((c) => !c.parentId);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory((prev) => ({ ...prev, name: e.target.value }));
    if (!newCategory.slug || newCategory.slug === generateSlug(newCategory.name)) {
      setNewCategory((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
    }
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCategory((prev) => prev ? { ...prev, name: e.target.value } : null);
    if (editCategory && (!editCategory.slug || editCategory.slug === generateSlug(editCategory.name))) {
      setEditCategory((prev) => prev ? { ...prev, slug: generateSlug(e.target.value) } : null);
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/owner/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        router.refresh();
        setNewCategory({ name: "", slug: "", description: "", parentId: "", isActive: true });
      } else {
        alert("Failed to create category");
      }
    } catch {
      alert("Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/owner/categories/${editCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCategory),
      });
      if (res.ok) {
        router.refresh();
        setEditCategory(null);
      } else {
        alert("Failed to update category");
      }
    } catch {
      alert("Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteCategoryId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/owner/categories/${deleteCategoryId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete category");
      }
    } catch {
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteCategoryId(null);
    }
  };

  const openEditDialog = (category: CategoryWithChildren) => {
    setEditCategory(category);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteCategoryId(id);
  };

  const formatCategoryTree = (cats: CategoryWithChildren[], level = 0): CategoryWithLevel[] => {
    return cats.flatMap((cat) => [
      { ...cat, _level: level },
      ...formatCategoryTree(cat.children as CategoryWithChildren[], level + 1),
    ]);
  };

  const categoryTree = formatCategoryTree(topLevelCategories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>Add a new category to organize your products</DialogDescription>
            </DialogHeader>
            <form onSubmit={createCategory}>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={newCategory.name}
                    onChange={handleNameChange}
                    placeholder="Category name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="auto-generated"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <Select value={newCategory.parentId} onValueChange={(v: string) => setNewCategory({ ...newCategory, parentId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top Level)</SelectItem>
                      {topLevelCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Category description"
                    rows={3}
                    className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="isActive" className="text-sm">Active</label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewCategory({ name: "", slug: "", description: "", parentId: "", isActive: true })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editCategory} onOpenChange={(open: boolean) => !open && setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {editCategory && (
            <form onSubmit={updateCategory}>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={editCategory.name}
                    onChange={handleEditNameChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={editCategory.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCategory({ ...editCategory!, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <Select value={editCategory.parentId ?? ""} onValueChange={(v: string) => setEditCategory({ ...editCategory!, parentId: v || null })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top Level)</SelectItem>
                      {topLevelCategories.filter(c => c.id !== editCategory.id).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editCategory.description ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditCategory({ ...editCategory!, description: e.target.value || null })}
                    rows={3}
                    className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editCategory.isActive}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCategory({ ...editCategory!, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="editIsActive" className="text-sm">Active</label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditCategory(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCategoryId} onOpenChange={(open: boolean) => !open && setDeleteCategoryId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Categories with products or subcategories cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCategory} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Parent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Products</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categoryTree.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {cat._level > 0 && <span className="text-muted-foreground">{'│ '.repeat(cat._level)}</span>}
                    <FolderOpen className="size-4 text-muted-foreground" />
                    <Link href={`/owner/categories/${cat.id}`} className="font-medium hover:text-primary">
                      {cat.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm">{cat.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{cat.parent?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{cat._count.products} products</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={cat.isActive ? "default" : "outline"} className="text-xs">
                    {cat.isActive ? "Active" : "Archived"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditDialog(cat)}
                      className="p-2 rounded-lg hover:bg-muted"
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(cat.id)}
                      className="p-2 rounded-lg hover:bg-muted text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}