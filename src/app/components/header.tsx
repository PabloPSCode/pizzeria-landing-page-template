"use client";

import {
  PhoneCallIcon,
  PizzaIcon,
  ShoppingCartIcon,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState, type ElementType } from "react";
import {
  Cart,
  LandingHeader,
  OrderFinalizationModal,
} from "../../libs/react-ultimate-components/src";
import type {
  FinalizedOrderData,
  OrderFinalizationPayload,
  OrderFinalizationResult,
} from "../../libs/react-ultimate-components/src/components/modals/OrderFinalizationModal/index";
import {
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "../../libs/react-ultimate-components/src/utils/toasts";
import { landingNavigationItems, MONLEVADE_WHATSAPP } from "../../mock";
import { sendMessageWhatsapp } from "../../utils/helpers";
import { useOrderCart } from "../providers/OrderCartProvider";
import { useStore } from "../providers/StoreProvider";
import { MobileMenuToggleButton, MobilePanel, Subtitle, Title } from "./ui";
import Image from "next/image";

const ORDER_FINALIZATION_ADDRESSES_STORAGE_KEY =
  "@monlevadepizzas:order-finalization-addresses";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOrderFinalizationOpen, setIsOrderFinalizationOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    items,
    itemCount,
    isCartOpen,
    openCart,
    closeCart,
    clearCart,
    setItems,
  } = useOrderCart();
  const { storeData } = useStore();
  const pickupLocationText = [
    storeData.address?.street,
    storeData.address?.zipCode ? `CEP ${storeData.address.zipCode}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const normalizedPathname = pathname.replace(/^\/sites\/[^/]+/, "") || "/";

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }

    return normalizedPathname === "/" ? href : `/${href}`;
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleProceedToCheckout = () => {
    if (!items.length) return;

    closeCart();
    setIsOrderFinalizationOpen(true);
  };

  const handleFinalizeOrder = async ({
    selectedAddress,
    items: orderItems,
    fulfillmentMethod,
    deliveryFee,
    total,
    customerWhatsapp,
  }: OrderFinalizationPayload): Promise<OrderFinalizationResult | void> => {
    showToastLoading("Gerando link de pagamento...");

    try {
      const response = await fetch("/api/asaas/payment-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          selectedAddress,
          fulfillmentMethod,
          deliveryFee,
          total,
          customerWhatsapp,
        }),
      });

      const responseBody = (await response.json()) as {
        message?: string;
        paymentLinkUrl?: string;
        paymentLinkId?: string | null;
        orderReference?: string | null;
      };

      if (!response.ok || !responseBody.paymentLinkUrl) {
        throw new Error(
          responseBody.message ??
            "Não foi possível gerar o link de pagamento no momento.",
        );
      }

      toast.dismiss("loading");
      showToastSuccess("Link de pagamento gerado com sucesso.");
      clearCart();

      return {
        paymentLinkUrl: responseBody.paymentLinkUrl,
        orderReference:
          typeof responseBody.orderReference === "string"
            ? responseBody.orderReference
            : undefined,
        paymentLinkId:
          typeof responseBody.paymentLinkId === "string"
            ? responseBody.paymentLinkId
            : undefined,
        total,
      };
    } catch (error) {
      toast.dismiss("loading");
      showToastError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o link de pagamento agora. Tente novamente.",
      );
    }
  };

  const handleSharePaymentLink = ({
    paymentLinkUrl,
    orderReference,
    total,
    fulfillmentMethod,
  }: FinalizedOrderData) => {
    const message = [
      `Olá! Quero compartilhar o link de pagamento do meu pedido na ${storeData.store.name}.`,
      orderReference ? `Pedido: ${orderReference}` : null,
      fulfillmentMethod === "pickup"
        ? "Forma de recebimento: retirada na loja"
        : "Forma de recebimento: entrega",
      `Total: ${formatBRL(total)}`,
      `Link de pagamento: ${paymentLinkUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    sendMessageWhatsapp(
      message,
      storeData.contact?.whatsapp ?? MONLEVADE_WHATSAPP,
    );
  };
  const NavComponent = LandingHeader.Nav as never as ElementType;
  const NavItemComponent = LandingHeader.Nav.Item as never as ElementType;

  return (
    <>
      <LandingHeader.Root
        className="border-b border-border-card bg-white/95 shadow-sm backdrop-blur-md min-h-[80px] pt-5"
        size="lg"
        bordered={false}
        sticky
        style={{ zIndex: 9999 }}
      >
        <LandingHeader.Left className="min-w-0">
          <button
            type="button"
            onClick={handleGoHome}
            className="flex min-w-0 items-center gap-1"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-12 h-12 sm:w-16 sm:h-16"
            />

            <span className="flex min-w-0 flex-col items-start leading-tight">
              <Title
                as="span"
                className="min-w-0 truncate !text-2xl leading-none !sm:text-4xl"
              >
                {storeData.store.name}
              </Title>
            </span>
          </button>
        </LandingHeader.Left>

        <LandingHeader.Center className="hidden lg:flex">
          <NavComponent className="!w-auto !overflow-x-hidden justify-center gap-10">
            {landingNavigationItems.map((item) => (
              <NavItemComponent key={item.label} href={resolveHref(item.href)}>
                {item.label}
              </NavItemComponent>
            ))}
          </NavComponent>
        </LandingHeader.Center>

        <LandingHeader.Right className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setShowMobileMenu(false);
              openCart();
            }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-card bg-white text-foreground transition hover:border-primary-500 hover:text-primary-600"
            aria-label="Abrir carrinho"
          >
            <ShoppingCartIcon weight="bold" className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </button>
          <MobileMenuToggleButton
            open={showMobileMenu}
            onToggle={setShowMobileMenu}
            className="rounded-full border border-border-card bg-white"
          />
        </LandingHeader.Right>

        <MobilePanel open={showMobileMenu}>
          <li className="w-full list-none px-2">
            <div className="rounded-[28px] border border-border-card bg-white p-5 text-left shadow-sm">
              <Subtitle
                as="span"
                className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-primary-600"
              >
                Navegação rápida
              </Subtitle>
              <div className="mt-4 flex flex-col gap-3">
                {landingNavigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={resolveHref(item.href)}
                    onClick={() => setShowMobileMenu(false)}
                    className="rounded-full border border-border-card bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </li>
        </MobilePanel>
      </LandingHeader.Root>

      <Cart
        products={items}
        isOpen={isCartOpen}
        onToggleOpen={closeCart}
        onProductsChange={setItems}
        onProceedToCheckout={handleProceedToCheckout}
        checkoutButtonText="Finalizar pedido"
        keepBuyingButtonText="Continuar comprando"
        emptyCartMessage="Seu carrinho está vazio."
      />

      <OrderFinalizationModal
        open={isOrderFinalizationOpen}
        onClose={() => setIsOrderFinalizationOpen(false)}
        items={items}
        onFinalize={handleFinalizeOrder}
        onSharePaymentLink={handleSharePaymentLink}
        pickupLocationText={pickupLocationText}
        storageKey={ORDER_FINALIZATION_ADDRESSES_STORAGE_KEY}
      />
    </>
  );
}
