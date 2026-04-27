"use client";

import clsx from "clsx";
import { formatBRL } from "../../../../utils/format";
import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  details?: string[];
  maxQuantity?: number;
  minQuantity?: number;
}

interface CartItemProps {
  product: Product;
  onIncreaseQuantity: (productId: string) => void;
  onDecreaseQuantity: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  removeDisabled?: boolean;
}

const getProductInitial = (name: string) => {
  return name.trim().charAt(0).toUpperCase() || "P";
};

export default function CartItem({
  product,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  increaseDisabled,
  decreaseDisabled,
  removeDisabled,
}: CartItemProps) {
  return (
    <div className="w-full rounded-2xl border border-foreground/10 bg-background/60 p-4 shadow-sm">
      <div className="flex items-start gap-4">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={72}
            height={72}
            className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-[72px] sm:w-[72px]"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-lg font-semibold text-primary-600 sm:h-[72px] sm:w-[72px]">
            {getProductInitial(product.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-foreground sm:text-base">
            {product.name}
          </p>

          {product.description ? (
            <p className="mt-1 text-xs leading-relaxed text-foreground/70 sm:text-sm">
              {product.description}
            </p>
          ) : null}

          {product.details?.length ? (
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-foreground/60 sm:text-xs">
              {product.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-primary-500/70" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          className="text-destructive-600 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onRemoveItem(product.id)}
          disabled={removeDisabled}
          aria-label={`Remover ${product.name}`}
        >
          <TrashIcon className="h-5 w-5 text-red-500" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className={clsx(
            "flex items-center gap-2 rounded-xl border border-foreground/10 bg-background px-2 py-1.5"
          )}
        >
          <button
            onClick={() => onDecreaseQuantity(product.id)}
            disabled={decreaseDisabled}
            className="rounded-full text-foreground transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Diminuir quantidade de ${product.name}`}
          >
            <MinusCircleIcon className="h-5 w-5" />
          </button>
          <span className="min-w-5 text-center text-sm font-medium text-foreground">
            {product.quantity}
          </span>
          <button
            onClick={() => onIncreaseQuantity(product.id)}
            disabled={increaseDisabled}
            className="rounded-full text-foreground transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Aumentar quantidade de ${product.name}`}
          >
            <PlusCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <span className="text-sm font-semibold text-foreground/85 sm:text-base">
          {formatBRL(product.price * product.quantity)}
        </span>
      </div>
    </div>
  );
}
