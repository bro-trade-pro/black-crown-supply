
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
  addItems: (items: NewCartItem[]) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  totalCents: number;
};

const STORAGE_KEY = "black-crown-cart";

const CartContext =
  createContext<CartContextType | null>(null);

function makeKey(item: NewCartItem) {
  return `${item.productId}:${item.variantId ?? "base"}`;
}

function lirePanier(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.key === "string" &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        typeof item.priceCents === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(lirePanier());
    setReady(true);

    // Synchronise les autres onglets du même site.
    function synchroniser(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setItems(lirePanier());
      }
    }

    window.addEventListener(
      "storage",
      synchroniser
    );

    return () => {
      window.removeEventListener(
        "storage",
        synchroniser
      );
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    }
  }, [items, ready]);

  function addItems(newItems: NewCartItem[]) {
    setItems((current) => {
      const next = [...current];

      for (const item of newItems) {
        if (
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          continue;
        }

        const key = makeKey(item);

        const index = next.findIndex(
          (existing) => existing.key === key
        );

        if (index >= 0) {
          next[index] = {
            ...item,
            key,
            quantity:
              next[index].quantity +
              item.quantity,
          };
        } else {
          next.push({
            ...item,
            key,
          });
        }
      }

      return next;
    });
  }

  function updateQuantity(
    key: string,
    quantity: number
  ) {
    if (
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      return;
    }

    setItems((current) =>
      quantity === 0
        ? current.filter(
            (item) => item.key !== key
          )
        : current.map((item) =>
            item.key === key
              ? { ...item, quantity }
              : item
          )
    );
  }

  function removeItem(key: string) {
    setItems((current) =>
      current.filter(
        (item) => item.key !== key
      )
    );
  }

  function clearCart() {
    // Effacement immédiat, sans attendre React.
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalCents = items.reduce(
    (sum, item) =>
      sum + item.priceCents * item.quantity,
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
