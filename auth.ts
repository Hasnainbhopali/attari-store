import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import type { Cart, CartItem, Product } from "@prisma/client";

const OWNER_EMAIL = "hasnainhm128@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as Role) ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = (token.role as Role) ?? "CUSTOMER";
        }
      }
      return session;
    },
    async signIn({ user }) {
      // Enforce single-owner authorization server-side on every sign-in
      if (user.email && user.id) {
        const desiredRole: Role =
          user.email.toLowerCase() === OWNER_EMAIL ? "OWNER" : "CUSTOMER";
        const currentRole = user.role ?? "CUSTOMER";

        if (currentRole !== desiredRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: desiredRole },
          });
          user.role = desiredRole;
        }
      }

      // After successful sign in, merge guest cart if exists
      if (user?.id) {
        try {
const guestCart = await prisma.cart.findFirst({
            where: { userId: { equals: null } } as unknown as import("@prisma/client").Prisma.CartWhereInput,
            include: { items: true },
          }) as (Cart & { items: CartItem[] }) | null;

          if (guestCart && guestCart.items && guestCart.items.length > 0) {
            let userCart = await prisma.cart.findUnique({
              where: { userId: user.id },
              include: { items: true },
            }) as (Cart & { items: CartItem[] }) | null;

            if (!userCart) {
              userCart = await prisma.cart.create({
                data: { userId: user.id },
                include: { items: true },
              }) as Cart & { items: CartItem[] };
            }

            for (const item of guestCart.items) {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, stockQuantity: true, isActive: true },
              });

              if (!product || !product.isActive) continue;

              const existingItem = userCart.items.find((ci) => ci.productId === item.productId);
              const totalQuantity = (existingItem?.quantity ?? 0) + item.quantity;
              const finalQuantity = Math.min(totalQuantity, product.stockQuantity);

              if (existingItem) {
                await prisma.cartItem.update({
                  where: { id: existingItem.id },
                  data: { quantity: finalQuantity },
                });
              } else if (finalQuantity > 0) {
                await prisma.cartItem.create({
                  data: {
                    cartId: userCart.id,
                    productId: item.productId,
                    quantity: finalQuantity,
                  },
                });
              }
            }

            // Delete guest cart after merge
            await prisma.cart.delete({ where: { id: guestCart.id } });
          }
        } catch (error) {
          console.error("Guest cart merge on sign in failed:", error);
        }
      }
      return true;
    },
  },
});