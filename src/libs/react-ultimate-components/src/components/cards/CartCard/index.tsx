"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CartCardItem, {
  type PriceDisplayMode,
  type Product,
} from "./components/CartItem";

export type { PriceDisplayMode, Product };

interface CartCardProps {
  products: Product[];
  emptyCartCardMessage?: string;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  listClassName?: string;
  emptyStateClassName?: string;
  itemClassName?: string;
  itemImageClassName?: string;
  itemPlaceholderImageClassName?: string;
  itemContentClassName?: string;
  itemNameClassName?: string;
  itemDescriptionClassName?: string;
  itemBadgeClassName?: string;
  itemMetadataClassName?: string;
  itemControlsWrapperClassName?: string;
  itemQuantityControlsClassName?: string;
  itemQuantityButtonClassName?: string;
  itemQuantityValueClassName?: string;
  itemPriceClassName?: string;
  itemRemoveButtonClassName?: string;
  showImage?: boolean;
  showRemoveButton?: boolean;
  showQuantityControls?: boolean;
  priceMode?: PriceDisplayMode;
  keepZeroQuantityItems?: boolean;
  productMinQuantity?: number;
  productMaxQuantity?: number;
  onProductsChange?: (products: Product[]) => void;
  onIncreaseQuantity?: (product: Product, products: Product[]) => void;
  onDecreaseQuantity?: (product: Product, products: Product[]) => void;
  onRemoveItem?: (product: Product, products: Product[]) => void;
  isIncreaseDisabled?: (product: Product, products: Product[]) => boolean;
  isDecreaseDisabled?: (product: Product, products: Product[]) => boolean;
  isRemoveDisabled?: (product: Product, products: Product[]) => boolean;
  priceFormatter?: (product: Product, priceMode: PriceDisplayMode) => ReactNode;
  quantityLabelFormatter?: (product: Product) => ReactNode;
}

const getUniqueProducts = (products: Product[]) => {
  return Array.from(new Map(products.map((item) => [item.id, item])).values());
};

export default function CartCard({
  products,
  emptyCartCardMessage,
  title = "Seu carrinho",
  description,
  className,
  headerClassName,
  titleClassName,
  descriptionClassName,
  listClassName,
  emptyStateClassName,
  itemClassName,
  itemImageClassName,
  itemPlaceholderImageClassName,
  itemContentClassName,
  itemNameClassName,
  itemDescriptionClassName,
  itemBadgeClassName,
  itemMetadataClassName,
  itemControlsWrapperClassName,
  itemQuantityControlsClassName,
  itemQuantityButtonClassName,
  itemQuantityValueClassName,
  itemPriceClassName,
  itemRemoveButtonClassName,
  showImage = true,
  showRemoveButton = true,
  showQuantityControls = true,
  priceMode = "total",
  keepZeroQuantityItems = false,
  productMinQuantity,
  productMaxQuantity,
  onProductsChange,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  isIncreaseDisabled,
  isDecreaseDisabled,
  isRemoveDisabled,
  priceFormatter,
  quantityLabelFormatter,
}: CartCardProps) {
  const [cartItems, setCartCardItems] = useState<Product[]>(products);

  useEffect(() => {
    setCartCardItems(products);
  }, [products]);

  const commitItems = useCallback(
    (
      updater: (previousItems: Product[]) => Product[],
      callback?: (nextItems: Product[], previousItems: Product[]) => void
    ) => {
      setCartCardItems((previousItems) => {
        const nextItems = updater(previousItems);
        onProductsChange?.(nextItems);
        callback?.(nextItems, previousItems);
        return nextItems;
      });
    },
    [onProductsChange]
  );

  const uniqueCartCardItems = useMemo(() => {
    const uniqueItems = getUniqueProducts(cartItems);

    if (keepZeroQuantityItems) {
      return uniqueItems;
    }

    return uniqueItems.filter((item) => item.quantity > 0);
  }, [cartItems, keepZeroQuantityItems]);

  const handleDecreaseQuantity = useCallback(
    (productId: string) => {
      commitItems(
        (previousItems) =>
          previousItems.map((item) => {
            if (item.id !== productId) return item;

            const minQuantity =
              item.minQuantity ??
              productMinQuantity ??
              (showRemoveButton ? 1 : 0);

            return {
              ...item,
              quantity: Math.max(minQuantity, item.quantity - 1),
            };
          }),
        (nextItems) => {
          const product = getUniqueProducts(nextItems).find(
            (item) => item.id === productId
          );
          if (product) {
            onDecreaseQuantity?.(product, nextItems);
          }
        }
      );
    },
    [commitItems, onDecreaseQuantity, productMinQuantity, showRemoveButton]
  );

  const handleIncreaseQuantity = useCallback(
    (productId: string) => {
      commitItems(
        (previousItems) =>
          previousItems.map((item) => {
            if (item.id !== productId) return item;

            const maxQuantity = item.maxQuantity ?? productMaxQuantity;
            if (typeof maxQuantity === "number" && item.quantity >= maxQuantity) {
              return item;
            }

            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }),
        (nextItems) => {
          const product = getUniqueProducts(nextItems).find(
            (item) => item.id === productId
          );
          if (product) {
            onIncreaseQuantity?.(product, nextItems);
          }
        }
      );
    },
    [commitItems, onIncreaseQuantity, productMaxQuantity]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      commitItems(
        (previousItems) => previousItems.filter((item) => item.id !== productId),
        (nextItems) => {
          const removedProduct = getUniqueProducts(cartItems).find(
            (item) => item.id === productId
          );
          if (removedProduct) {
            onRemoveItem?.(removedProduct, nextItems);
          }
        }
      );
    },
    [cartItems, commitItems, onRemoveItem]
  );

  return (
    <div
      className={clsx(
        "flex flex-col rounded-2xl border border-border-card bg-bg-card p-4 text-foreground shadow-sm",
        className
      )}
    >
      {(title || description) && (
        <div className={clsx("mb-4", headerClassName)}>
          {title ? (
            <span className={clsx("text-base font-semibold", titleClassName)}>
              {title}
            </span>
          ) : null}
          {description ? (
            <p
              className={clsx(
                "mt-1 text-sm text-foreground/65",
                descriptionClassName
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div
        className={clsx(
          "flex max-h-[30vh] flex-col gap-3 overflow-y-auto text-foreground/70 sm:pr-1",
          listClassName
        )}
      >
        {uniqueCartCardItems.length > 0 ? (
          uniqueCartCardItems.map((product) => (
            <CartCardItem
              key={product.id}
              product={product}
              onDecreaseQuantity={handleDecreaseQuantity}
              onIncreaseQuantity={handleIncreaseQuantity}
              onRemoveItem={handleRemoveItem}
              showImage={showImage}
              showRemoveButton={showRemoveButton}
              showQuantityControls={showQuantityControls}
              priceMode={priceMode}
              className={itemClassName}
              imageClassName={itemImageClassName}
              placeholderImageClassName={itemPlaceholderImageClassName}
              contentClassName={itemContentClassName}
              nameClassName={itemNameClassName}
              descriptionClassName={itemDescriptionClassName}
              badgeClassName={itemBadgeClassName}
              metadataClassName={itemMetadataClassName}
              controlsWrapperClassName={itemControlsWrapperClassName}
              quantityControlsClassName={itemQuantityControlsClassName}
              quantityButtonClassName={itemQuantityButtonClassName}
              quantityValueClassName={itemQuantityValueClassName}
              priceClassName={itemPriceClassName}
              removeButtonClassName={itemRemoveButtonClassName}
              increaseDisabled={isIncreaseDisabled?.(product, uniqueCartCardItems)}
              decreaseDisabled={isDecreaseDisabled?.(product, uniqueCartCardItems)}
              removeDisabled={isRemoveDisabled?.(product, uniqueCartCardItems)}
              priceFormatter={priceFormatter}
              quantityLabelFormatter={quantityLabelFormatter}
            />
          ))
        ) : (
          <div
            className={clsx(
              "rounded-xl border border-dashed border-foreground/15 p-4 text-foreground",
              emptyStateClassName
            )}
          >
            <p className="text-sm font-medium">Ops!</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/60">
              {emptyCartCardMessage || "Seu carrinho está vazio."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
