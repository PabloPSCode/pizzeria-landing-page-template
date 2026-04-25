"use client";

import { PizzaIcon, PhoneCallIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
import {
  LandingHeader,
} from "../../libs/react-ultimate-components/src";
import { landingNavigationItems, MONLEVADE_WHATSAPP } from "../../mock";
import { sendMessageWhatsapp } from "../../utils/helpers";
import { useStore } from "../providers/StoreProvider";
import {
  MobileMenuToggleButton,
  MobilePanel,
  Subtitle,
  Title,
} from "./ui";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { storeData } = useStore();

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

  const handleWhatsappOrder = (message?: string) => {
    sendMessageWhatsapp(
      message ?? "Olá, quero montar um pedido na MonlevadePizzas.",
      storeData.contact?.whatsapp ?? MONLEVADE_WHATSAPP
    );
  };

  const handleGoHome = () => {
    router.push("/");
  };
  const NavComponent = LandingHeader.Nav as never as ElementType;
  const NavItemComponent = LandingHeader.Nav.Item as never as ElementType;

  return (
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
          className="flex min-w-0 items-center gap-3"
        >
          <span className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-primary-500 text-white shadow-sm">
            <PizzaIcon weight="fill" className="h-5 w-5" />
          </span>
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
            <NavItemComponent
              key={item.label}
              href={resolveHref(item.href)}
            >
              {item.label}
            </NavItemComponent>
          ))}
        </NavComponent>
      </LandingHeader.Center>

      <LandingHeader.Right className="flex items-center gap-2 sm:gap-3">
        <div className="hidden flex-col items-end leading-tight md:flex">
          <a
            href={`tel:${(storeData.contact?.phone ?? "").replace(/\D/g, "")}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary-600"
          >
            <PhoneCallIcon weight="bold" className="h-4 w-4" />
            {storeData.contact?.phone ?? "(31) 98518-7963"}
          </a>
        </div>
        <LandingHeader.CTA
          label="Fazer pedido"
          onClick={() => handleWhatsappOrder()}
          className="hidden rounded-full bg-primary-500 px-5 py-3 text-sm text-white sm:inline-flex"
        />
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
            <button
              type="button"
              onClick={() => {
                setShowMobileMenu(false);
                handleWhatsappOrder();
              }}
              className="mt-4 inline-flex rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white w-full justify-center"
            >
              Fazer pedido agora
            </button>
          </div>
        </li>
      </MobilePanel>
    </LandingHeader.Root>
  );
}
