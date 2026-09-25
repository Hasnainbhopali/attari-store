import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CircleUserRound,
  Hammer,
  Headphones,
  Lightbulb,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
const categories = [
  {
    name: "Electrical",
    description: "Switches, sockets, wires & more",
    icon: Zap,
  },
  {
    name: "Hardware",
    description: "Tools, locks & fittings",
    icon: Hammer,
  },
  {
    name: "Lighting",
    description: "LEDs, bulbs & fixtures",
    icon: Lightbulb,
  },
  {
    name: "Tools",
    description: "Professional & home tools",
    icon: Wrench,
  },
];

const featuredProducts = [
  {
    name: "Electrical Switch & Socket",
    category: "Electrical",
    price: "PKR 450",
    badge: "Popular",
  },
  {
    name: "Premium LED Bulb",
    category: "Lighting",
    price: "PKR 650",
    badge: "Featured",
  },
  {
    name: "Heavy Duty Padlock",
    category: "Hardware",
    price: "PKR 850",
    badge: "Best Seller",
  },
  {
    name: "Professional Screwdriver Set",
    category: "Tools",
    price: "PKR 1,250",
    badge: "New",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
              <Sparkles className="size-3.5" />
              Trusted electrical & hardware store
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Everything you need.
              <span className="block text-muted-foreground">
                All in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Shop quality electrical and hardware products from ATTARI
              ELECTRIC AND HARDWARE STORE. Easy ordering, reliable products,
              and convenient delivery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Shop Products
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/categories"
                className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-6 text-sm font-semibold transition hover:bg-muted"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[360px] overflow-hidden rounded-2xl border bg-background lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted/50" />

            <div className="relative flex h-full flex-col items-center justify-center p-10 text-center">
              <div className="mb-6 flex size-24 items-center justify-center rounded-3xl border bg-background shadow-sm">
                <Zap className="size-12" />
              </div>

              <h2 className="text-2xl font-bold">
                Electrical. Hardware. Tools.
              </h2>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Quality products for homes, businesses and professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-5 sm:px-6">
            <ShieldCheck className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Quality Products</p>
              <p className="text-xs text-muted-foreground">
                Carefully selected products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-5 sm:px-6">
            <Headphones className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Customer Support</p>
              <p className="text-xs text-muted-foreground">
                We&apos;re here to help
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-5 sm:px-6">
            <ShoppingCart className="size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Easy Ordering</p>
              <p className="text-xs text-muted-foreground">
                Simple online checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              SHOP BY CATEGORY
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Find what you need
            </h2>
          </div>

          <Link
            href="/categories"
            className="hidden items-center gap-1 text-sm font-semibold sm:flex"
          >
            View all
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={`/categories/${category.name.toLowerCase()}`}
                className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-muted transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </div>

                <h3 className="font-semibold">{category.name}</h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {category.description}
                </p>

                <div className="mt-4 flex items-center text-xs font-medium">
                  Shop now
                  <ArrowRight className="ml-1 size-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                FEATURED
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Popular products
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-semibold sm:flex"
            >
              View all
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.name}
                href="/products"
                className="group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative flex aspect-square items-center justify-center bg-muted/50">
                  <div className="flex size-20 items-center justify-center rounded-2xl border bg-background">
                    <Wrench className="size-9 text-muted-foreground" />
                  </div>

                  <span className="absolute left-3 top-3 rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold shadow-sm">
                    {product.badge}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {product.category}
                  </p>

                  <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-3 text-base font-bold">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-muted/40 px-6 py-10 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Looking for something specific?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Search our growing collection of electrical, hardware, lighting
            and tool products.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Explore Products
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold text-foreground">
              ATTARI ELECTRIC AND HARDWARE STORE
            </p>
            <p className="mt-1 text-xs">
              Quality electrical & hardware products.
            </p>
          </div>

          <p className="text-xs">
            © {new Date().getFullYear()} Attari Electric & Hardware Store.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

