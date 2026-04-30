"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product as NavigationCartProduct } from "../../libs/react-ultimate-components/src/components/navigation/Cart/components/CartItem";
import type { OrderAssistentOrder } from "../../libs/react-ultimate-components/src/components/modals/OrderAssistentModal";
import type { PizzaOrderAssistentOrder } from "../../libs/react-ultimate-components/src/components/modals/PizzaOrderAssistentModal";
import { formatBRL } from "../../libs/react-ultimate-components/src/utils/format";

export interface OrderCartItem extends NavigationCartProduct {
  details?: string[];
  order?: PizzaOrderAssistentOrder | OrderAssistentOrder;
}

interface OrderCartSeed {
  productId?: string;
  title: string;
  imageUrl?: string;
}

interface OrderCartContextValue {
  items: OrderCartItem[];
  isCartOpen: boolean;
  itemCount: number;
  totalAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItems: (items: OrderCartItem[]) => void;
  clearCart: () => void;
  addPizzaOrder: (
    seed: OrderCartSeed,
    order: PizzaOrderAssistentOrder
  ) => OrderCartItem;
  addOrder: (
    seed: OrderCartSeed,
    order: OrderAssistentOrder
  ) => OrderCartItem;
}

const OrderCartContext = createContext<OrderCartContextValue | null>(null);

const normalizeId = (value: string) => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildPizzaCartItemDetails = (order: PizzaOrderAssistentOrder) => {
  const details: string[] = [];

  const flavorsLabel = order.flavors.map((flavor) => flavor.name).join(" + ");
  if (flavorsLabel) {
    details.push(`Sabores: ${flavorsLabel}`);
  }

  if (order.borderOption) {
    details.push(
      `Borda: ${order.borderOption.label} (+ ${formatBRL(order.borderOption.price)})`
    );
  }

  if (order.extraIngredients.length > 0) {
    details.push(
      `Extras: ${order.extraIngredients
        .map((ingredient) => ingredient.name)
        .join(", ")}`
    );
  }

  if (order.candies.length > 0) {
    details.push(
      `Doces: ${order.candies
        .map((candy) => `${candy.quantity}x ${candy.name}`)
        .join(", ")}`
    );
  }

  if (order.drinks.length > 0) {
    details.push(
      `Bebidas: ${order.drinks
        .map((drink) => `${drink.quantity}x ${drink.name}`)
        .join(", ")}`
    );
  }

  if (order.observation.trim()) {
    details.push(`Obs.: ${order.observation.trim()}`);
  }

  return details;
};

const buildOrderCartItemDetails = (order: OrderAssistentOrder) => {
  const details: string[] = [];

  if (order.foodIngredients.length > 0) {
    details.push(`Composição: ${order.foodIngredients.join(", ")}`);
  }

  if (order.candies.length > 0) {
    details.push(
      `Doces: ${order.candies
        .map((candy) => `${candy.quantity}x ${candy.name}`)
        .join(", ")}`
    );
  }

  if (order.drinks.length > 0) {
    details.push(
      `Bebidas: ${order.drinks
        .map((drink) => `${drink.quantity}x ${drink.name}`)
        .join(", ")}`
    );
  }

  if (order.observation.trim()) {
    details.push(`Obs.: ${order.observation.trim()}`);
  }

  return details;
};

export const buildOrderCartWhatsappMessage = (
  items: OrderCartItem[],
  storeName: string
) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const lines = [
    `Olá, gostaria de finalizar meu pedido na ${storeName}.`,
    "",
    ...items.flatMap((item, index) => {
      const itemLines = [
        `${index + 1}. ${item.quantity}x ${item.name} - ${formatBRL(
          item.price * item.quantity
        )}`,
      ];

      if (item.details?.length) {
        itemLines.push(...item.details.map((detail) => `   - ${detail}`));
      }

      return itemLines;
    }),
    "",
    `Total do carrinho: ${formatBRL(total)}`,
  ];

  return lines.join("\n");
};

export function OrderCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(
    () => setIsCartOpen((previousState) => !previousState),
    []
  );
  const clearCart = useCallback(() => setItems([]), []);

  const addPizzaOrder = useCallback(
    (seed: OrderCartSeed, order: PizzaOrderAssistentOrder) => {
      const primaryFlavor = order.flavors[0];
      const name =
        order.flavorMode === 2
          ? `Pizza meio a meio: ${order.flavors
              .map((flavor) => flavor.name)
              .join(" + ")}`
          : `Pizza ${primaryFlavor?.name ?? seed.title}`;
      const imageUrl = primaryFlavor?.imageUrl ?? seed.imageUrl ?? "/pizza1.jpg";

      const nextItem: OrderCartItem = {
        id: `${
          seed.productId ? normalizeId(seed.productId) : normalizeId(name)
        }-${Date.now()}`,
        name,
        price: order.totalPrice,
        quantity: 1,
        imageUrl,
        details: buildPizzaCartItemDetails(order),
        order,
      };

      setItems((previousItems) => [...previousItems, nextItem]);
      setIsCartOpen(true);

      return nextItem;
    },
    []
  );

  const addOrder = useCallback(
    (seed: OrderCartSeed, order: OrderAssistentOrder) => {
      const name = order.foodName || seed.title;

      const nextItem: OrderCartItem = {
        id: `${
          seed.productId ? normalizeId(seed.productId) : normalizeId(name)
        }-${Date.now()}`,
        name,
        price: order.totalPrice,
        quantity: 1,
        imageUrl: seed.imageUrl,
        details: buildOrderCartItemDetails(order),
        order,
      };

      setItems((previousItems) => [...previousItems, nextItem]);
      setIsCartOpen(true);

      return nextItem;
    },
    []
  );

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const value = useMemo<OrderCartContextValue>(
    () => ({
      items,
      isCartOpen,
      itemCount,
      totalAmount,
      openCart,
      closeCart,
      toggleCart,
      setItems,
      clearCart,
      addPizzaOrder,
      addOrder,
    }),
    [
      addOrder,
      addPizzaOrder,
      clearCart,
      closeCart,
      isCartOpen,
      itemCount,
      items,
      openCart,
      toggleCart,
      totalAmount,
    ]
  );

  return (
    <OrderCartContext.Provider value={value}>
      {children}
    </OrderCartContext.Provider>
  );
}

export function useOrderCart() {
  const context = useContext(OrderCartContext);
  if (!context) {
    throw new Error("useOrderCart must be used within OrderCartProvider");
  }

  return context;
}
