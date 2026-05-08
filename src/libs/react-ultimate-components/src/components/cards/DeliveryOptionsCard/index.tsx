"use client";
import { formatBRL } from "../../../utils/format";
import clsx from "clsx";
import { useMemo, useState } from "react";

export interface Address {
  id: string;
  label: string;
  address: string;
  residenceNumber: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  country?: string;
}

export interface Option {
  id: string;
  label: string;
  deliveryEstimate: string;
  price: number;
}

interface DeliveryOptionsCardProps {
  options: Option[];
  address?: Address | null;
  selectedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  onBack?: () => void;
  pickupDescription?: string;
  className?: string;
}

export default function DeliveryOptionsCard({
  options,
  address,
  className,
  selectedOptionId,
  onSelectOption,
  onBack,
  pickupDescription = "Retire seu pedido diretamente na loja.",
}: DeliveryOptionsCardProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<
    string | undefined
  >(selectedOptionId ?? options[0]?.id);

  const normalizedInternalSelectedId =
    internalSelectedId && options.some((option) => option.id === internalSelectedId)
      ? internalSelectedId
      : undefined;
  const activeSelectedId =
    selectedOptionId ?? normalizedInternalSelectedId ?? options[0]?.id;
  const activeOption = useMemo(
    () => options.find((opt) => opt.id === activeSelectedId),
    [activeSelectedId, options]
  );
  const selectedOptionLabel = useMemo(() => {
    if (!activeSelectedId) return undefined;
    return options.find((opt) => opt.id === activeSelectedId)?.label;
  }, [activeSelectedId, options]);
  const handleSelectOption = (optionId: string) => {
    if (onSelectOption) {
      onSelectOption(optionId);
    }
    if (!selectedOptionId) {
      setInternalSelectedId(optionId);
    }
  };

  return (
    <div
      className={clsx(
        "w-full rounded-md border border-border-card bg-bg-card p-5 sm:p-6 shadow-sm text-foreground",
        "flex flex-col gap-5",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-base sm:text-lg font-semibold">
            Selecione como deseja receber
          </span>
          {selectedOptionLabel && (
            <p className="text-xs sm:text-sm text-foreground/70">
              Opção selecionada:{" "}
              <span className="font-semibold text-foreground">
                {selectedOptionLabel}
              </span>
            </p>
          )}
        </div>
        {activeOption?.id === "pickup" ? (
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-foreground/70">
              Retirada na loja:{" "}
              <span className="font-semibold text-foreground">
                {pickupDescription}
              </span>
            </p>
          </div>
        ) : address ? (
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-foreground/70">
              Entregar no endereço:{" "}
              <span className="font-semibold text-foreground">
                {`${address.address}, ${address.residenceNumber}${
                  address.complement ? `, ${address.complement}` : ""
                }, ${address.neighborhood}${
                  address.zipCode ? ` - CEP ${address.zipCode}` : ""
                }`}
              </span>
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs sm:text-sm text-info-500 underline"
                >
                  Alterar
                </button>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-foreground/70">
              Selecione um endereço para entrega ou retire na loja.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = activeSelectedId === option.id;
          return (
            <div
              key={option.id}
              className={clsx(
                "rounded-lg border p-4 cursor-pointer",
                "bg-background",
                isSelected ? "border-primary-500 " : "border-border-card "
              )}
            >
              <label className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3 flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="selected-delivery-option"
                    className="mt-1 size-4 accent-primary-500 cursor-pointer"
                    checked={isSelected}
                    onChange={() => handleSelectOption(option.id)}
                    aria-label={`Selecionar ${option.label}`}
                  />
                  <div className="w-full flex flex-col gap-1 text-sm sm:text-base">
                    <span className="font-semibold text-foreground">
                      {option.label}
                    </span>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-foreground">
                        {option.deliveryEstimate}
                      </span>
                      <span className="text-xs sm:text-sm text-foreground">
                        {formatBRL(option.price)}{" "}
                        {option.price === 0 ? "(Grátis)" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
