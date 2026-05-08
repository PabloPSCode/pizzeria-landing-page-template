"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import Button from "../../buttons/button/index";
import type { Product as CartProduct } from "../../cards/CartCard/index";
import CartCard from "../../cards/CartCard/index";
import DeliveryOptionsCard from "../../cards/DeliveryOptionsCard/index";
import type { Address } from "../../cards/ManageAddressesCard/index";
import ManageAddressesCard from "../../cards/ManageAddressesCard/index";
import type { ManageAddressFormValues } from "../../cards/ManageAddressesCard/ManageAddressModal";
import InternationalPhoneInput from "../../inputs/InternationalPhoneInput/index";
import StepProgress from "../../miscellaneous/StepProgress/index";
import GenericModal from "../GenericModal/index";

const DEFAULT_STORAGE_KEY =
  "react-ultimate-components:order-finalization-addresses";
const DEFAULT_DELIVERY_FEE = 15;
const EMPTY_ADDRESSES: Address[] = [];
const DEFAULT_CONTACT_STORAGE_KEY =
  "react-ultimate-components:order-finalization-whatsapp";

const stepLabels = ["Recebimento", "Revisão do pedido", "Pagamento"];

export type OrderFulfillmentMethod = "delivery" | "pickup";

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

const normalizePhoneDigits = (value: string) => value.replace(/\D/g, "");

const isValidWhatsappNumber = (value: string) =>
  /^55\d{10,11}$/.test(normalizePhoneDigits(value));

const createAddressFromFormValues = (
  values: ManageAddressFormValues,
): Address => {
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
  selectedAddress: Address | null;
  items: CartProduct[];
  fulfillmentMethod: OrderFulfillmentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerWhatsapp: string;
}

export interface OrderFinalizationResult {
  paymentLinkId?: string | null;
  paymentLinkUrl: string;
  orderReference?: string | null;
  total: number;
}

export interface FinalizedOrderData
  extends OrderFinalizationPayload, OrderFinalizationResult {}

export interface OrderFinalizationModalProps {
  open: boolean;
  onClose: () => void;
  items: CartProduct[];
  onFinalize?: (
    payload: OrderFinalizationPayload,
  ) => Promise<OrderFinalizationResult | void> | OrderFinalizationResult | void;
  onSharePaymentLink?: (payload: FinalizedOrderData) => void;
  initialAddresses?: Address[];
  defaultSelectedAddressId?: string;
  deliveryFee?: number;
  storageKey?: string;
  title?: string;
  description?: string;
  continueButtonLabel?: string;
  backButtonLabel?: string;
  finalizeButtonLabel?: string;
  finishButtonLabel?: string;
  openPaymentLinkButtonLabel?: string;
  copyPaymentLinkButtonLabel?: string;
  copiedPaymentLinkButtonLabel?: string;
  sharePaymentLinkButtonLabel?: string;
  pickupLocationText?: string;
  defaultCustomerWhatsapp?: string;
  contactStorageKey?: string;
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
  description = "Escolha entre entrega ou retirada na loja e revise o carrinho antes de concluir.",
  continueButtonLabel = "Continuar",
  backButtonLabel = "Voltar",
  finalizeButtonLabel = "Gerar link de pagamento",
  finishButtonLabel = "Concluir",
  openPaymentLinkButtonLabel = "Abrir link de pagamento",
  copyPaymentLinkButtonLabel = "Copiar link",
  copiedPaymentLinkButtonLabel = "Link copiado",
  sharePaymentLinkButtonLabel = "Compartilhar no WhatsApp",
  pickupLocationText = "Retire seu pedido diretamente na loja.",
  defaultCustomerWhatsapp = "",
  contactStorageKey = DEFAULT_CONTACT_STORAGE_KEY,
  className,
  onSharePaymentLink,
}: OrderFinalizationModalProps) {
  const fallbackAddresses = initialAddresses ?? EMPTY_ADDRESSES;
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>(
    () => fallbackAddresses,
  );
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(() => defaultSelectedAddressId ?? fallbackAddresses[0]?.id);
  const [customerWhatsapp, setCustomerWhatsapp] = useState(
    defaultCustomerWhatsapp,
  );
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<OrderFulfillmentMethod>("delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalizedOrder, setFinalizedOrder] =
    useState<FinalizedOrderData | null>(null);
  const [hasCopiedPaymentLink, setHasCopiedPaymentLink] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadedAddresses = readAddressesFromStorage(
      storageKey,
      fallbackAddresses,
    );
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
    setFulfillmentMethod("delivery");
    setIsSubmitting(false);
    setFinalizedOrder(null);
    setHasCopiedPaymentLink(false);

    const storedWhatsapp = window.localStorage.getItem(contactStorageKey);
    setCustomerWhatsapp(storedWhatsapp ?? defaultCustomerWhatsapp);
  }, [
    contactStorageKey,
    defaultCustomerWhatsapp,
    defaultSelectedAddressId,
    fallbackAddresses,
    open,
    storageKey,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, open, storageKey]);

  useEffect(() => {
    if (!open) {
      return;
    }

    window.localStorage.setItem(contactStorageKey, customerWhatsapp);
  }, [contactStorageKey, customerWhatsapp, open]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const effectiveDeliveryFee = fulfillmentMethod === "pickup" ? 0 : deliveryFee;
  const total = subtotal + effectiveDeliveryFee;
  const hasValidWhatsapp = isValidWhatsappNumber(customerWhatsapp);
  const requiresAddress = fulfillmentMethod === "delivery";

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
    if ((requiresAddress && !selectedAddress) || !hasValidWhatsapp) {
      return;
    }

    setCurrentStep(1);
  };

  const handleFinalize = async () => {
    if ((requiresAddress && !selectedAddress) || items.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        selectedAddress:
          fulfillmentMethod === "pickup" ? null : selectedAddress,
        items,
        fulfillmentMethod,
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        total,
        customerWhatsapp,
      };
      const result = await onFinalize?.(payload);

      if (result?.paymentLinkUrl) {
        setFinalizedOrder({
          ...payload,
          ...result,
        });
        setCurrentStep(2);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!finalizedOrder?.paymentLinkUrl) {
      return;
    }

    await navigator.clipboard.writeText(finalizedOrder.paymentLinkUrl);
    setHasCopiedPaymentLink(true);
    window.setTimeout(() => setHasCopiedPaymentLink(false), 2000);
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
            <DeliveryOptionsCard
              options={[
                {
                  id: "delivery",
                  label: "Receber em casa",
                  deliveryEstimate: "Entrega no endereço selecionado",
                  price: deliveryFee,
                },
                {
                  id: "pickup",
                  label: `Retirar na loja`,
                  deliveryEstimate: pickupLocationText,
                  price: 0,
                },
              ]}
              address={selectedAddress}
              selectedOptionId={fulfillmentMethod}
              onSelectOption={(optionId) =>
                setFulfillmentMethod(
                  optionId === "pickup" ? "pickup" : "delivery",
                )
              }
              pickupDescription={pickupLocationText}
            />

            {fulfillmentMethod === "delivery" ? (
              <ManageAddressesCard
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onCreateAddress={handleCreateAddress}
                onUpdateAddress={handleUpdateAddress}
                onRemoveAddress={handleRemoveAddress}
              />
            ) : (
              <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                <span className="text-base font-semibold">
                  Retirada na loja
                </span>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                  {pickupLocationText}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                  Sem taxa de entrega
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
              <span className="text-base font-semibold">
                WhatsApp para receber o link
              </span>
              <p className="mt-1 text-sm text-foreground/70">
                Informe um número com WhatsApp para seguirmos com o pagamento.
              </p>
              <div className="mt-4">
                <InternationalPhoneInput
                  label="WhatsApp*"
                  value={customerWhatsapp}
                  onChange={setCustomerWhatsapp}
                  defaultCountry="br"
                  preferredCountries={["br"]}
                  placeholder="Seu WhatsApp com DDI"
                  helperText="Usaremos esse número para identificar o pedido no atendimento."
                  errorMessage={
                    customerWhatsapp && !hasValidWhatsapp
                      ? "Informe um WhatsApp válido com DDI +55."
                      : undefined
                  }
                />
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                label="Fechar"
                variant="outlined"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="button"
                label={continueButtonLabel}
                onClick={handleAdvanceStep}
                disabled={
                  (requiresAddress && !selectedAddress) ||
                  !hasValidWhatsapp ||
                  isSubmitting
                }
                className="w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        ) : currentStep === 1 ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-5">
              <CartCard
                products={items}
                title="Itens confirmados"
                showQuantityControls={false}
                showRemoveButton={false}
                className="rounded-2xl"
                listClassName="max-h-[42vh]"
              />
              {fulfillmentMethod === "delivery" && selectedAddress ? (
                <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                  <span className="text-base font-semibold">
                    Endereço selecionado
                  </span>
                  <div className="mt-3 rounded-xl bg-background p-4">
                    <p className="text-sm font-semibold">
                      {selectedAddress.label}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">
                      {buildAddressLabel(selectedAddress)}
                    </p>
                    <p className="mt-1 text-xs text-foreground/70">
                      {selectedAddress.neighborhood} - CEP{" "}
                      {selectedAddress.zipCode}
                    </p>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                  <span className="text-base font-semibold">
                    Retirada na loja
                  </span>
                  <div className="mt-3 rounded-xl bg-background p-4">
                    <p className="text-sm text-foreground/80">
                      {pickupLocationText}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                      Sem taxa de entrega
                    </p>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                <span className="text-base font-semibold">
                  WhatsApp informado
                </span>
                <div className="mt-3 rounded-xl bg-background p-4">
                  <p className="text-sm text-foreground/80">
                    {customerWhatsapp}
                  </p>
                </div>
              </section>
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
                    {fulfillmentMethod === "pickup"
                      ? "Retirada na loja"
                      : "Taxa de entrega"}
                  </span>
                  <span className="font-bold text-primary-600">
                    {formatBRL(effectiveDeliveryFee)}
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
                  label={isSubmitting ? "Gerando link..." : finalizeButtonLabel}
                  onClick={handleFinalize}
                  disabled={
                    (requiresAddress && !selectedAddress) ||
                    items.length === 0 ||
                    !hasValidWhatsapp ||
                    isSubmitting
                  }
                  className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                />
                <Button
                  type="button"
                  label={backButtonLabel}
                  variant="outlined"
                  onClick={() => setCurrentStep(0)}
                  disabled={isSubmitting}
                  className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </section>
          </div>
        ) : finalizedOrder ? (
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                <span className="text-base font-semibold">
                  Resumo final do pedido
                </span>
                <div className="mt-4 space-y-3 rounded-xl border border-foreground/10 bg-background p-4">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-foreground/70">
                      Forma de recebimento
                    </span>
                    <span className="text-right font-medium text-foreground">
                      {finalizedOrder.fulfillmentMethod === "pickup"
                        ? "Retirada na loja"
                        : "Entrega"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-foreground/70">
                      {finalizedOrder.fulfillmentMethod === "pickup"
                        ? "Local de retirada"
                        : "Endereço"}
                    </span>
                    <span className="max-w-[60%] text-right font-medium text-foreground">
                      {finalizedOrder.fulfillmentMethod === "pickup" ||
                      !finalizedOrder.selectedAddress
                        ? pickupLocationText
                        : `${buildAddressLabel(finalizedOrder.selectedAddress)} - ${finalizedOrder.selectedAddress.neighborhood}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatBRL(finalizedOrder.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/70">Taxa de entrega</span>
                    <span className="font-medium text-foreground">
                      {formatBRL(finalizedOrder.deliveryFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
                    <span className="text-base font-semibold text-foreground">
                      Total final
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatBRL(finalizedOrder.total)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border-card bg-bg-card p-5 text-foreground shadow-sm">
                <span className="text-base font-semibold">
                  Link de pagamento
                </span>
                <p className="mt-1 text-sm text-foreground/70">
                  Abra o link para pagar ou compartilhe-o manualmente no
                  WhatsApp.
                </p>

                <div className="mt-4 rounded-xl border border-foreground/10 bg-background p-4">
                  <p className="break-all text-sm text-primary-700">
                    {finalizedOrder.paymentLinkUrl}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    type="button"
                    label={openPaymentLinkButtonLabel}
                    onClick={() =>
                      window.open(
                        finalizedOrder.paymentLinkUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="w-full justify-center"
                  />
                  <Button
                    type="button"
                    label={
                      hasCopiedPaymentLink
                        ? copiedPaymentLinkButtonLabel
                        : copyPaymentLinkButtonLabel
                    }
                    variant="outlined"
                    onClick={handleCopyPaymentLink}
                    className="w-full justify-center"
                  />
                  {onSharePaymentLink ? (
                    <Button
                      type="button"
                      label={sharePaymentLinkButtonLabel}
                      variant="outlined"
                      onClick={() => onSharePaymentLink(finalizedOrder)}
                      className="w-full justify-center"
                    />
                  ) : null}
                  <Button
                    type="button"
                    label={finishButtonLabel}
                    onClick={onClose}
                    className="w-full justify-center"
                  />
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </GenericModal>
  );
}
