"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import Button from "../../buttons/button/index";
import type { Product as CartProduct } from "../../cards/CartCard/index";
import CartCard from "../../cards/CartCard/index";
import type { Address } from "../../cards/ManageAddressesCard/index";
import ManageAddressesCard from "../../cards/ManageAddressesCard/index";
import type { ManageAddressFormValues } from "../../cards/ManageAddressesCard/ManageAddressModal";
import StepProgress from "../../miscellaneous/StepProgress/index";
import GenericModal from "../GenericModal/index";

const DEFAULT_STORAGE_KEY = "react-ultimate-components:order-finalization-addresses";
const DEFAULT_DELIVERY_FEE = 15;
const EMPTY_ADDRESSES: Address[] = [];

const stepLabels = ["Endereço", "Revisão do pedido"];

const isStoredAddress = (value: unknown): value is Address => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const address = value as Partial<Address>;

  return Boolean(
    typeof address.id === "string" &&
      typeof address.label === "string" &&
      typeof address.address === "string" &&
      typeof address.residenceNumber === "string" &&
      typeof address.neighborhood === "string" &&
      typeof address.city === "string" &&
      typeof address.state === "string" &&
      typeof address.zipCode === "string",
  );
};

const readAddressesFromStorage = (
  storageKey: string,
  fallbackAddresses: Address[],
) => {
  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return fallbackAddresses;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return fallbackAddresses;
    }

    const validAddresses = parsedValue.filter(isStoredAddress);
    return validAddresses.length > 0 ? validAddresses : fallbackAddresses;
  } catch {
    return fallbackAddresses;
  }
};

const buildAddressLabel = (address: Address) => {
  return `${address.address}, ${address.residenceNumber}${
    address.complement ? ` - ${address.complement}` : ""
  }`;
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const createAddressFromFormValues = (values: ManageAddressFormValues): Address => {
  const generatedId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `address-${Date.now()}`;

  return {
    id: generatedId,
    ...values,
  };
};

export interface OrderFinalizationPayload {
  selectedAddress: Address;
  items: CartProduct[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderFinalizationModalProps {
  open: boolean;
  onClose: () => void;
  items: CartProduct[];
  onFinalize?: (payload: OrderFinalizationPayload) => void;
  initialAddresses?: Address[];
  defaultSelectedAddressId?: string;
  deliveryFee?: number;
  storageKey?: string;
  title?: string;
  description?: string;
  continueButtonLabel?: string;
  backButtonLabel?: string;
  finalizeButtonLabel?: string;
  className?: string;
}

export default function OrderFinalizationModal({
  open,
  onClose,
  items,
  onFinalize,
  initialAddresses,
  defaultSelectedAddressId,
  deliveryFee = DEFAULT_DELIVERY_FEE,
  storageKey = DEFAULT_STORAGE_KEY,
  title = "Finalização do pedido",
  description = "Confirme o endereço de entrega e revise o carrinho antes de concluir.",
  continueButtonLabel = "Continuar",
  backButtonLabel = "Voltar para endereços",
  finalizeButtonLabel = "Finalizar pedido",
  className,
}: OrderFinalizationModalProps) {
  const fallbackAddresses = initialAddresses ?? EMPTY_ADDRESSES;
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>(() => fallbackAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    () => defaultSelectedAddressId ?? fallbackAddresses[0]?.id,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadedAddresses = readAddressesFromStorage(storageKey, fallbackAddresses);
    const nextSelectedAddressId =
      defaultSelectedAddressId ??
      loadedAddresses[0]?.id ??
      fallbackAddresses[0]?.id;

    setAddresses(loadedAddresses);
    setSelectedAddressId((currentSelectedAddressId) =>
      currentSelectedAddressId === nextSelectedAddressId
        ? currentSelectedAddressId
        : nextSelectedAddressId,
    );
    setCurrentStep((previousStep) => (previousStep === 0 ? previousStep : 0));
  }, [defaultSelectedAddressId, fallbackAddresses, open, storageKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, open, storageKey]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const total = subtotal + deliveryFee;

  const handleCreateAddress = (values: ManageAddressFormValues) => {
    const nextAddress = createAddressFromFormValues(values);
    setAddresses((previousAddresses) => [...previousAddresses, nextAddress]);
    setSelectedAddressId(nextAddress.id);
  };

  const handleUpdateAddress = (updatedAddress: Address) => {
    setAddresses((previousAddresses) =>
      previousAddresses.map((address) =>
        address.id === updatedAddress.id ? updatedAddress : address,
      ),
    );
  };

  const handleRemoveAddress = (addressId: string) => {
    setAddresses((previousAddresses) => {
      const nextAddresses = previousAddresses.filter(
        (address) => address.id !== addressId,
      );

      if (selectedAddressId === addressId) {
        setSelectedAddressId(nextAddresses[0]?.id);
      }

      return nextAddresses;
    });
  };

  const handleAdvanceStep = () => {
    if (!selectedAddress) {
      return;
    }

    setCurrentStep(1);
  };

  const handleFinalize = () => {
    if (!selectedAddress || items.length === 0) {
      return;
    }

    onFinalize?.({
      selectedAddress,
      items,
      subtotal,
      deliveryFee,
      total,
    });
  };

  return (
    <GenericModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
      className={clsx("max-w-5xl", className)}
      showCancelButton={false}
      showConfirmButton={false}
    >
      <div className="flex flex-col gap-6">
        <StepProgress
          steps={stepLabels}
          currentStep={currentStep}
          className="mx-auto"
        />

        {currentStep === 0 ? (
          <div className="flex flex-col gap-5">
            <ManageAddressesCard
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onCreateAddress={handleCreateAddress}
              onUpdateAddress={handleUpdateAddress}
              onRemoveAddress={handleRemoveAddress}
            />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                label="Fechar"
                variant="outlined"
                onClick={onClose}
                className="w-full justify-center sm:w-auto"
              />
              <Button
                type="button"
                label={continueButtonLabel}
                onClick={handleAdvanceStep}
                disabled={!selectedAddress}
                className="w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
            <div className="flex flex-col gap-5">
              <CartCard
                products={items}
                title="Itens do carrinho"
                description="Confira os produtos escolhidos antes de enviar o pedido."
                showQuantityControls={false}
                showRemoveButton={false}
                className="rounded-2xl"
                listClassName="max-h-[42vh]"
              />

              {selectedAddress ? (
                <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                  <span className="text-base font-semibold">
                    Endereço selecionado
                  </span>
                  <div className="mt-3 rounded-xl bg-background p-4">
                    <p className="text-sm font-semibold">{selectedAddress.label}</p>
                    <p className="mt-1 text-sm text-foreground/80">
                      {buildAddressLabel(selectedAddress)}
                    </p>
                    <p className="mt-1 text-xs text-foreground/70">
                      {selectedAddress.neighborhood} - {selectedAddress.city}/
                      {selectedAddress.state} - CEP {selectedAddress.zipCode}
                    </p>
                  </div>
                </section>
              ) : null}
            </div>

            <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
              <span className="text-base font-semibold">Resumo do pedido</span>
              
              <div className="mt-5 space-y-3 rounded-xl border border-foreground/10 bg-background p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground/70">Subtotal dos itens</span>
                  <span className="font-medium text-foreground">
                    {formatBRL(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg bg-primary-500/10 px-3 py-3 text-sm">
                  <span className="font-semibold text-primary-600">
                    Taxa de entrega
                  </span>
                  <span className="font-bold text-primary-600">
                    {formatBRL(deliveryFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
                  <span className="text-base font-semibold text-foreground">
                    Total do pedido
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatBRL(total)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button
                  type="button"
                  label={finalizeButtonLabel}
                  onClick={handleFinalize}
                  disabled={!selectedAddress || items.length === 0}
                  className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                />
                <Button
                  type="button"
                  label={backButtonLabel}
                  variant="outlined"
                  onClick={() => setCurrentStep(0)}
                  className="w-full justify-center"
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </GenericModal>
  );
}
