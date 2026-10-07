"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

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

type ProductImage = {
  id: string;
  image_url: string | null;
};

type VariantImage = {
  id: string;
  product_id: string;
  image_url: string | null;
};

const STORAGE_KEY = "black-crown-cart";

const CartContext =
  createContext<CartContextType | null>(null);

function makeKey(item: NewCartItem) {
  return `${item.productId}:${item.variantId ?? "base"}`;
}

function publicImageUrl(value: string | null) {
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  return supabase.storage
    .from("product-images")
    .getPublicUrl(value).data.publicUrl;
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

async function actualiserImages(
  panier: CartItem[]
): Promise<CartItem[]> {
  if (panier.length === 0) return panier;

  try {
    const productIds = [
      ...new Set(panier.map((item) => item.productId)),
    ];

    const variantIds = [
      ...new Set(
        panier
          .map((item) => item.variantId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const { data: produits, error: erreurProduits } =
      await supabase
        .from("products")
        .select("id,image_url")
        .in("id", productIds);

    if (erreurProduits) throw erreurProduits;

    let variantes: VariantImage[] = [];

    if (variantIds.length > 0) {
      const { data, error } = await supabase
        .from("product_variants")
        .select("id,product_id,image_url")
        .in("id", variantIds);

      if (error) throw error;
      variantes = (data ?? []) as VariantImage[];
    }

    const imagesProduits = new Map(
      ((produits ?? []) as ProductImage[]).map(
        (produit) => [
          produit.id,
          publicImageUrl(produit.image_url),
        ]
      )
    );

    const imagesVariantes = new Map(
      variantes.map((variante) => [
        variante.id,
        publicImageUrl(variante.image_url),
      ])
    );

    return panier.map((item) => {
      const imageVariante = item.variantId
        ? imagesVariantes.get(item.variantId)
        : null;

      const imageProduit =
        imagesProduits.get(item.productId) ?? null;

      return {
        ...item,
        imageUrl:
          imageVariante ||
          imageProduit ||
          publicImageUrl(item.imageUrl),
      };
    });
  } catch (error) {
    console.error(
      "Impossible d'actualiser les images du panier :",
      error
    );

    return panier.map((item) => ({
      ...item,
      imageUrl: publicImageUrl(item.imageUrl),
    }));
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
    let actif = true;
    const panierSauvegarde = lirePanier();

    setItems(
      panierSauvegarde.map((item) => ({
        ...item,
        imageUrl: publicImageUrl(item.imageUrl),
      }))
    );
    setReady(true);

    actualiserImages(panierSauvegarde).then(
      (panierActualise) => {
        if (actif) {
          setItems(panierActualise);
        }
      }
    );

    function synchroniser(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;

      const panier = lirePanier();

      setItems(
        panier.map((item) => ({
          ...item,
          imageUrl: publicImageUrl(item.imageUrl),
        }))
      );

      actualiserImages(panier).then(
        (panierActualise) => {
          if (actif) {
            setItems(panierActualise);
          }
        }
      );
    }

    window.addEventListener("storage", synchroniser);

    return () => {
      actif = false;
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

        const normalizedItem = {
          ...item,
          imageUrl: publicImageUrl(item.imageUrl),
        };

        const key = makeKey(normalizedItem);

        const index = next.findIndex(
          (existing) => existing.key === key
        );

        if (index >= 0) {
          next[index] = {
            ...normalizedItem,
            key,
            quantity:
              next[index].quantity +
              normalizedItem.quantity,
          };
        } else {
          next.push({
            ...normalizedItem,
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
