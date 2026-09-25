import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Hammer,
  Lightbulb,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Electrical: Zap,
  Hardware: Hammer,
  Lighting: Lightbulb,
  Tools: Wrench,
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Quality Products",
    description: "Carefully selected electrical & hardware products",
  },
  {
    icon: Truck,
    title: "Fast Local Delivery",
    description: "Fast delivery across Pakistan",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Multiple secure payment options",
  },
  {
    icon: Truck,
    title: "Easy Returns",
    description: "30-day return policy",
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function Home() {
  const [categories, featuredProducts, popularProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getProducts({ isFeatured: false, pageSize: 8, sortBy: "newest" }),
  ]);

  // Type assertion since Prisma select doesn't include isActive but DB has it
  const typedCategories = categories as Array<typeof categories[0] & { isActive: boolean }>;

  // Type assertion for popular products to match ProductCard props
  const typedPopularProducts = popularProducts.products as unknown as Array<{
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
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    category: { id: string; name: string; slug: string } | null;
  }>;

  // Type assertion for featured products to match ProductCard props
  const typedFeaturedProducts = featuredProducts as unknown as Array<{
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
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    category: { id: string; name: string; slug: string } | null;
  }>;

  const topLevelCategories = typedCategories.filter((c) => !c.parentId);

  return (
    <main className="min-h-screen bg-background">
      {/* Marketplace Category Navigation Strip */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-16 z-40" aria-label="Category navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide" role="navigation" aria-label="Product categories">
            <Link
              href="/products"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-muted bg-primary text-primary-foreground"
            >
              All Categories
            </Link>
            {typedCategories
              .filter((c) => c.isActive)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-muted/30 via-background to-background py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="max-w-2xl">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                <Sparkles className="size-3.5" />
                Pakistan's Leading Electrical & Hardware Store
              </div>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Everything Electrical & Hardware.
                <span className="block text-primary"> All in One Place.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Shop quality electrical, hardware, lighting and tool products from ATTARI
                ELECTRIC AND HARDWARE STORE. Easy ordering, reliable products, and fast delivery across Pakistan.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Shop Now
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/categories"
                  className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-6 text-sm font-semibold transition hover:bg-muted"
                >
                  Browse Categories
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-4" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[320px] lg:block">
              <div className="relative aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/20 border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/10" />
                <div className="relative h-full flex flex-col items-center justify-center p-10 text-center">
                  <div className="mb-6 flex size-28 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20">
                    <Zap className="size-14 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold">Electrical. Hardware. Tools.</h2>

                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Quality products for homes, businesses and professionals across Pakistan.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link
                      href="/categories/electrical"
                      className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      <Zap className="size-4" />
                      Electrical
                    </Link>
                    <Link
                      href="/categories/hardware"
                      className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      <Hammer className="size-4" />
                      Hardware
                    </Link>
                    <Link
                      href="/categories/tools"
                      className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      <Wrench className="size-4" />
                      Tools
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Strip (Desktop) / Horizontal Scroll (Mobile) */}
      <nav className="border-b bg-background" aria-label="Quick category access">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="navigation" aria-label="Quick categories">
            {(() => {
              const navItems = [
                { name: "All Categories", href: "/products", count: 0 },
                ...typedCategories
                  .filter((c) => c.isActive && c._count.products > 0)
                  .slice(0, 10)
                  .map((c) => ({
                    name: c.name,
                    href: `/categories/${c.slug}`,
                    count: c._count.products,
                  }),
                ),
              ];
              return navItems.map((cat, index) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={
                    index === 0
                      ? "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground"
                      : "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-muted text-muted-foreground hover:text-foreground"
                  }
                >
                  <span className="flex items-center gap-1">
                    {cat.name}
                    {cat.count && cat.count > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted/50">{cat.count}</span>
                    )}
                  </span>
                </Link>
              ));
            })()}
          </div>
        </div>
      </nav>

      {/* Shop by Category Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Shop by Category
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Find What You Need
              </h2>
            </div>

            <Link
              href="/categories"
              className="hidden items-center gap-1 text-sm font-semibold sm:flex text-primary hover:underline"
            >
              View All Categories
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {typedCategories
              .filter((c) => c.isActive && !c.parentId && c._count.products > 0)
              .slice(0, 8)
              .map((category) => {
                const Icon = categoryIcons[category.name];
                const imageUrl = category.image;
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group relative rounded-xl border bg-card overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:border-primary/50"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted/30">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon className="size-12 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                          {category._count.products} products
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {category.description || `${category._count.products} products available`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted hover:border-primary/50"
              >
                View All Categories
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 sm:py-24 border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Featured
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured Products
                </h2>
              </div>

              <Link
                href="/products?sort=featured"
                className="hidden items-center gap-1 text-sm font-semibold sm:flex text-primary hover:underline"
              >
                View All Featured
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {typedFeaturedProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="grid" />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/products?sort=featured"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted hover:border-primary/50"
              >
                View All Featured Products
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Products / Shop Essentials */}
        {typedPopularProducts.length > 0 && (
          <section className="py-16 sm:py-24 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Popular
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                    Popular Electrical & Hardware
                  </h2>
                </div>

                <Link
                  href="/products?sort=newest"
                  className="hidden items-center gap-1 text-sm font-semibold sm:flex text-primary hover:underline"
                >
                  View All
                  <ChevronRight className="size-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {typedPopularProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="grid" />
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/products?sort=newest"
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted hover:border-primary/50"
                >
                  View All Products
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Trust/Service Strip */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <item.icon className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <p className="font-semibold text-foreground">ATTARI ELECTRIC AND HARDWARE STORE</p>
                <p className="text-sm text-muted-foreground">
                  Quality electrical, hardware, lighting & tool products for homes, businesses and professionals.
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition">
                    Categories
                  </Link>
                  <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition ml-4">
                    Products
                  </Link>
                </div>
              </div>

              <nav className="space-y-3">
                <h4 className="font-semibold">Shop</h4>
                <ul className="space-y-2">
                  <li><Link href="/categories/electrical" className="text-sm text-muted-foreground hover:text-foreground transition">Electrical</Link></li>
                  <li><Link href="/categories/hardware" className="text-sm text-muted-foreground hover:text-foreground transition">Hardware</Link></li>
                  <li><Link href="/categories/lighting" className="text-sm text-muted-foreground hover:text-foreground transition">Lighting</Link></li>
                  <li><Link href="/categories/tools" className="text-sm text-muted-foreground hover:text-foreground transition">Tools</Link></li>
                </ul>
              </nav>

              <nav className="space-y-3">
                <h4 className="font-semibold">Support</h4>
                <ul className="space-y-2">
                  <li><Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground transition">My Orders</Link></li>
                  <li><Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground transition">Shopping Cart</Link></li>
                  <li><Link href="/account" className="text-sm text-muted-foreground hover:text-foreground transition">My Account</Link></li>
                  <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition">Contact Us</Link></li>
                </ul>
              </nav>

              <div className="space-y-3">
                <h4 className="font-semibold">Contact</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>ATTARI Electric & Hardware Store</li>
                  <li>Pakistan</li>
                  <li><a href="mailto:info@attari.pk" className="hover:text-foreground transition">info@attari.pk</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} ATTARI Electric & Hardware Store. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
  );
}