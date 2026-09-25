"use client";

import Link from "next/link";
import { Search, ShoppingCart, CircleUserRound, Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CartButton } from "@/components/cart";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchSuggestion {
  type: "product" | "category";
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  category?: string;
  productCount?: number;
}

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);
  }, [fetchSuggestions]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
    debouncedFetch(value);
  };

  const handleFocus = () => {
    if (searchQuery.length >= 2 && suggestions.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow click on suggestions
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          // Navigate to full search results
          window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product") {
      window.location.href = `/products/${suggestion.slug}`;
    } else {
      window.location.href = `/categories/${suggestion.slug}`;
    }
    setIsDropdownOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none tracking-tight">ATTARI</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Electric & Hardware
              </p>
            </div>
          </div>
        </Link>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <div className="relative ml-auto flex max-w-xl flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search electrical & hardware products..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="h-10 w-full rounded-lg border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={isDropdownOpen && suggestions.length > 0}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}

          {/* Search Suggestions Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border bg-background shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-3",
                    selectedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  aria-selected={selectedIndex === index}
                >
                  {suggestion.type === "product" && (
                    <>
                      {suggestion.image && (
                        <Image
                          src={suggestion.image}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{suggestion.name}</p>
                        {suggestion.category && (
                          <p className="text-xs text-muted-foreground truncate">{suggestion.category}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Product</span>
                    </>
                  )}
                  {suggestion.type === "category" && (
                    <>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                        <svg className="size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.productCount} products</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary/10 text-secondary">Category</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}

          {isDropdownOpen && !isLoading && suggestions.length === 0 && searchQuery.length >= 2 && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border bg-background shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 p-4 text-center text-muted-foreground"
            >
              No products or categories found for "{searchQuery}"
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/categories"
            className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Categories
          </Link>

          <CartButton />

          <Link
            href="/account"
            className="rounded-lg p-2.5 transition hover:bg-muted"
            aria-label="Account"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={`${session.user.name ?? "User"} profile`}
                className="size-5 rounded-full"
              />
            ) : (
              <CircleUserRound className="size-5" />
            )}
          </Link>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search electrical & hardware products..."
              className="h-10 w-full rounded-lg border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/categories"
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Categories
            </Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted">
              Cart
            </Link>
            <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted">
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}