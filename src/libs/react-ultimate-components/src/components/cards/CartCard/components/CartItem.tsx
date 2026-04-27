"use client";

import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { formatBRL } from "../../../../utils/format";

export type PriceDisplayMode = "total" | "unit" | "none";

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  badge?: ReactNode;
  metadata?: ReactNode;
  maxQuantity?: number;
  minQuantity?: number;
}

interface CartItemProps {
  product: Product;
  onIncreaseQuantity: (productId: string) => void;
  onDecreaseQuantity: (productId: string) => void;
  onRemoveItem?: (productId: string) => void;
  showImage?: boolean;
  showRemoveButton?: boolean;
  showQuantityControls?: boolean;
  priceMode?: PriceDisplayMode;
  className?: string;
  imageClassName?: string;
  placeholderImageClassName?: string;
  contentClassName?: string;
  nameClassName?: string;
  descriptionClassName?: string;
  badgeClassName?: string;
  metadataClassName?: string;
  controlsWrapperClassName?: string;
  quantityControlsClassName?: string;
  quantityButtonClassName?: string;
  quantityValueClassName?: string;
  priceClassName?: string;
  removeButtonClassName?: string;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  removeDisabled?: boolean;
  priceFormatter?: (product: Product, priceMode: PriceDisplayMode) => ReactNode;
  quantityLabelFormatter?: (product: Product) => ReactNode;
}

const getProductInitial = (name: string) => {
  return name.trim().charAt(0).toUpperCase() || "P";
};

export default function CartItem({
  product,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  showImage = true,
  showRemoveButton = true,
  showQuantityControls = true,
  priceMode = "total",
  className,
  imageClassName,
  placeholderImageClassName,
  contentClassName,
  nameClassName,
  descriptionClassName,
  badgeClassName,
  metadataClassName,
  controlsWrapperClassName,
  quantityControlsClassName,
  quantityButtonClassName,
  quantityValueClassName,
  priceClassName,
  removeButtonClassName,
  increaseDisabled,
  decreaseDisabled,
  removeDisabled,
  priceFormatter,
  quantityLabelFormatter,
}: CartItemProps) {
  const formattedPrice = (() => {
    if (priceMode === "none") return null;
    if (priceFormatter) return priceFormatter(product, priceMode);
    return formatBRL(
      priceMode === "unit" ? product.price : product.price * product.quantity
    );
  })();

  return (
    <div
      className={clsx(
        "w-full rounded-2xl border border-foreground/10 bg-bg-card p-3 text-foreground",
        "flex flex-col gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      {showImage ? (
        product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={64}
            height={64}
            className={clsx(
              "h-16 w-16 shrink-0 rounded-xl object-cover",
              imageClassName
            )}
          />
        ) : (
          <div
            className={clsx(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-lg font-semibold text-primary-600",
              placeholderImageClassName
            )}
          >
            {getProductInitial(product.name)}
          </div>
        )
      ) : null}

      <div className={clsx("min-w-0 flex-1", contentClassName)}>

        <p
          className={clsx(
            "text-sm font-semibold leading-snug sm:text-base",
            nameClassName
          )}
        >
          {product.name}
        </p>

        {product.description ? (
          <p
            className={clsx(
              "mt-1 text-xs leading-relaxed text-foreground/65 sm:text-sm",
              descriptionClassName
            )}
          >
            {product.description}
          </p>
        ) : null}

        {product.metadata ? (
          <div
            className={clsx(
              "mt-2 text-xs text-foreground/75 sm:text-sm",
              metadataClassName
            )}
          >
            {product.metadata}
          </div>
        ) : null}
      </div>

      <div
        className={clsx(
          "flex items-center justify-between gap-3 sm:justify-end",
          controlsWrapperClassName
        )}
      >
        {showQuantityControls ? (
          <div
            className={clsx(
              "flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/80 px-2 py-1.5",
              quantityControlsClassName
            )}
          >
            <button
              type="button"
              onClick={() => onDecreaseQuantity(product.id)}
              disabled={decreaseDisabled}
              className={clsx(
                "rounded-full text-foreground transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40",
                quantityButtonClassName
              )}
              aria-label={`Diminuir quantidade de ${product.name}`}
            >
              <MinusCircleIcon className="h-5 w-5" />
            </button>
            <span
              className={clsx(
                "min-w-5 text-center text-sm font-medium",
                quantityValueClassName
              )}
            >
              {quantityLabelFormatter
                ? quantityLabelFormatter(product)
                : product.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncreaseQuantity(product.id)}
              disabled={increaseDisabled}
              className={clsx(
                "rounded-full text-foreground transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40",
                quantityButtonClassName
              )}
              aria-label={`Aumentar quantidade de ${product.name}`}
            >
              <PlusCircleIcon className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {formattedPrice ? (
          <span
            className={clsx(
              "text-sm font-medium text-foreground/80 sm:text-base",
              priceClassName
            )}
          >
            {formattedPrice}
          </span>
        ) : null}

        {showRemoveButton && onRemoveItem ? (
          <button
            type="button"
            className={clsx(
              "text-destructive-600 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40",
              removeButtonClassName
            )}
            onClick={() => onRemoveItem(product.id)}
            disabled={removeDisabled}
            aria-label={`Remover ${product.name}`}
          >
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
