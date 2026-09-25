"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="destructive"
      className="w-full justify-start"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-4 mr-2" />
      Logout
    </Button>
  );
}