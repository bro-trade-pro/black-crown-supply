
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { CartProvider } from "@/app/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Black Crown Supply | Wholesale Pro",
  description:
    "Distribution B2B de produits capillaires professionnels.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
