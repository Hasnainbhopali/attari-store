"use client";

import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, variant = "default" }: { title: string; variant?: "default" | "destructive" }) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toast, toasts };
}