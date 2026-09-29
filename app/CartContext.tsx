
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  key: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
};

export type NewCartItem = Omit<CartItem, "key">;

type CartContextType = {
  items: CartItem[];
  ready: boolean;
  addItems: (newItems: NewCartItem[]) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalCents: number;
};

const STORAGE_KEY = "black-crown-cart";

const CartContext = createContext<CartContextType | null>(null);

function makeKey(item: NewCartItem) {
  return `${item.productId}:${item.variantId ?? "base"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Récupération du panier enregistré dans le navigateur.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(
            parsed.filter(
              (item): item is CartItem =>
                item !== null &&
                typeof item === "object" &&
                typeof item.key === "string" &&
                typeof item.productId === "string" &&
                typeof item.quantity === "number" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0 &&
                typeof item.priceCents === "number"
            )
          );
        }
      }
    } catch (error) {
      console.error("Impossible de récupérer le panier :", error);
    }

    setReady(true);
  }, []);

  // Enregistrement après chaque modification.
  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Impossible d'enregistrer le panier :", error);
    }
  }, [items, ready]);

  function addItems(newItems: NewCartItem[]) {
    setItems((current) => {
      const next = [...current];

      for (const item of newItems) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          continue;
        }

        const key = makeKey(item);
        const existingIndex = next.findIndex(
          (existing) => existing.key === key
        );

        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...item,
            key,
            quantity:
              next[existingIndex].quantity + item.quantity,
          };
        } else {
          next.push({ ...item, key });
        }
      }

      return next;
    });
  }

  function updateQuantity(key: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 0) return;

    setItems((current) =>
      quantity === 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) =>
            item.key === key ? { ...item, quantity } : item
          )
    );
  }

  function removeItem(key: string) {
    setItems((current) =>
      current.filter((item) => item.key !== key)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalCents = items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItems,
        updateQuantity,
        removeItem,
        clearCart,
        totalQuantity,
        totalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart doit être utilisé dans CartProvider"
    );
  }

  return context;
}
