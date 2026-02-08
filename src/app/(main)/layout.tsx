import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { ConditionalLayout } from "@/components/conditional-layout";
import NavBar from "@/components/nav/nav-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <ConditionalLayout navbar={<NavBar />}>
          {children}
        </ConditionalLayout>
      </WishlistProvider>
    </CartProvider>
  );
}
