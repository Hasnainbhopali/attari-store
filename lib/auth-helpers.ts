import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current user session on the server.
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current authenticated user or null.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Enforce authentication for server components and actions.
 * Redirects to sign in if not authenticated.
 */
export async function requireAuth(callbackUrl = "/checkout") {
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session.user;
}

/**
 * Enforce OWNER authorization for owner/admin server components and actions.
 * Redirects to sign in if not authenticated, or home if not OWNER.
 */
export async function requireOwner(callbackUrl = "/owner") {
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (session.user.role !== "OWNER") {
    redirect("/");
  }
  return session.user;
}
