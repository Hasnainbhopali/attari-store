"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    images: Array<{ id: string; url: string; altText: string | null }>;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeGuestCart: (guestItems: Array<{ productId: string; quantity: number }>) => Promise<void>;
  initializeGuestCart: () => void;
}

const GUEST_CART_KEY = "attari_guest_cart";

function getGuestCartFromStorage(): Array<{ productId: string; quantity: number }> {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("attari_guest_cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGuestCartToStorage(items: Array<{ productId: string; quantity: number }>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("attari_guest_cart", JSON.stringify(items));
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const fetchedRef = useRef(false);
  const isGuest = useRef(true);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        isGuest.current = false;
      } else {
        // Not authenticated - load guest cart from localStorage
        const guestCart = getGuestCartFromStorage();
        isGuest.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchCart();
    }
  }, [fetchCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = async (productId: string, quantity = 1): Promise<boolean> => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        await fetchCart();
        openCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number): Promise<void> => {
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItem = async (cartItemId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const mergeGuestCart = async (guestItems: Array<{ productId: string; quantity: number }>): Promise<void> => {
    if (!guestItems.length) return;

    try {
      const response = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: guestItems }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to merge guest cart:", error);
    }
  };

  const refreshCart = fetchCart;

  // Initialize guest cart from localStorage on mount
  const initializeGuestCart = useCallback(() => {
    if (typeof window !== "undefined" && isGuest.current) {
      const guestCart = getGuestCartFromStorage();
      if (guestCart.length > 0) {
        // Fetch product details for guest cart items
        const productIds = guestCart.map(item => item.productId);
        fetch("/api/cart/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        })
          .then(res => res.ok ? res.json() : Promise.reject())
          .then(data => {
            if (data.items) setItems(data.items);
          })
          .catch(() => {
            // If guest API fails, clear invalid cart
            localStorage.removeItem("attari_guest_cart");
          });
      }
    }
  }, []);

  useEffect(() => {
    initializeGuestCart();
  }, [initializeGuestCart]);

  // Persist guest cart to localStorage whenever items change (for guests)
  useEffect(() => {
    if (isGuest.current && typeof window !== "undefined") {
      const guestItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      saveGuestCartToStorage(guestItems);
    }
  }, [items]);

  // Sync guest cart to localStorage on add/update/remove
  const syncGuestCart = () => {
    if (isGuest.current) {
      const guestItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      saveGuestCartToStorage(guestItems);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
        mergeGuestCart,
        initializeGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}