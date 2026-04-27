"use client";

import clsx from "clsx";
import { formatBRL } from "../../../utils/format";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import CartItem, { type Product } from "./components/CartItem";

interface CartProps {
  onToggleOpen: () => void;
  isOpen?: boolean;
  products: Product[];
  emptyCartMessage?: string;
  onProceedToCheckout?: () => void;
  checkoutButtonText?: string;
  keepBuyingButtonText?: string;
  onProductsChange?: (products: Product[]) => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  emptyTitle?: ReactNode;
}

export default function Cart({
  onToggleOpen,
  isOpen = false,
  products,
  emptyCartMessage,
  onProceedToCheckout,
  checkoutButtonText,
  keepBuyingButtonText,
  onProductsChange,
  title = "Seus itens",
  eyebrow = "Carrinho",
  emptyTitle = "Ops!",
}: CartProps) {
  const [cartItems, setCartItems] = useState<Product[]>(products);

  useEffect(() => {
    setCartItems(products);
  }, [products]);

  const commitItems = useCallback(
    (updater: (previousItems: Product[]) => Product[]) => {
      setCartItems((previousItems) => {
        const nextItems = updater(previousItems);
        onProductsChange?.(nextItems);
        return nextItems;
      });
    },
    [onProductsChange]
  );

  const uniqueCartItems = useMemo(() => {
    return Array.from(
      new Map(cartItems.map((item) => [item.id, item])).values()
    );
  }, [cartItems]);

  const handleDecreaseQuantity = useCallback(
    (productId: string) => {
      commitItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== productId) return item;

          const minQuantity = item.minQuantity ?? 1;

          return {
            ...item,
            quantity: Math.max(minQuantity, item.quantity - 1),
          };
        })
      );
    },
    [commitItems]
  );

  const handleIncreaseQuantity = useCallback(
    (productId: string) => {
      commitItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== productId) return item;

          const maxQuantity = item.maxQuantity;
          if (typeof maxQuantity === "number" && item.quantity >= maxQuantity) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + 1,
          };
        })
      );
    },
    [commitItems]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      commitItems((previousItems) =>
        previousItems.filter((item) => item.id !== productId)
      );
    },
    [commitItems]
  );

  const totalAmount = useMemo(() => {
    return uniqueCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [uniqueCartItems]);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-300 z-40",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggleOpen}
      />
      <nav
        className={clsx(
          "fixed top-0 right-0 z-50 flex h-screen w-full max-w-full flex-col bg-white transition-all duration-500 ease-out sm:border-l sm:border-white/10 sm:px-6 sm:py-8",
          "px-4 py-6 gap-5 sm:gap-6",
          "!sm:w-md max-w-md",
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-foreground/50">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-tight sm:text-xl">
              {title}
            </h2>
          </div>
          <button
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            onClick={onToggleOpen}
          >
            Fechar
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto text-foreground/70 sm:pr-1">
          {uniqueCartItems.length > 0 ? (
            uniqueCartItems.map((product) => (
              <CartItem
                key={product.id}
                product={product}
                onDecreaseQuantity={handleDecreaseQuantity}
                onIncreaseQuantity={handleIncreaseQuantity}
                onRemoveItem={handleRemoveItem}
                increaseDisabled={
                  typeof product.maxQuantity === "number" &&
                  product.quantity >= product.maxQuantity
                }
                decreaseDisabled={product.quantity <= (product.minQuantity ?? 1)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-foreground/10 bg-background/70 p-5 text-foreground">
              <p className="text-sm font-medium">{emptyTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/60">
                {emptyCartMessage || "Seu carrinho está vazio."}
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full justify-end">
          <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
            Total: {formatBRL(totalAmount)}
          </h3>
        </div>

        <div className="space-y-3">
          <button
            className="w-full rounded-2xl bg-primary-500 px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onProceedToCheckout}
            disabled={!uniqueCartItems.length}
          >
            {checkoutButtonText || "Finalizar compra"}
          </button>
          <button
            className="w-full px-4 py-2 text-base font-medium text-foreground"
            onClick={onToggleOpen}
          >
            {keepBuyingButtonText || "Continuar comprando"}
          </button>
        </div>
      </nav>
    </>
  );
}
