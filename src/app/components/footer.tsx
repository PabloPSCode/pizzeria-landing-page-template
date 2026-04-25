"use client";

import {
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneCallIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import { Footer as FooterRC } from "../../libs/react-ultimate-components/src";
import GoogleMapsRender from "../../libs/react-ultimate-components/src/components/forms/miscellaneous/GoogleMapsRender/index";
import { landingNavigationItems } from "../../mock";
import { useStore } from "../providers/StoreProvider";
import { Section, Subtitle, Title } from "./ui";

export default function Footer() {
  const pathname = usePathname();
  const { storeData } = useStore();
  const normalizedPathname = pathname.replace(/^\/sites\/[^/]+/, "") || "/";

  const resolveHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }

    return normalizedPathname === "/" ? href : `/${href}`;
  };

  const institutionalItems = landingNavigationItems.map((item) => ({
    href: resolveHref(item.href),
    label: item.label,
  }));

  const supportItems = [
    storeData.store.operation.mondayToFriday && {
      label: `Seg–Sex: ${storeData.store.operation.mondayToFriday}`,
    },
    storeData.store.operation.saturday && {
      label: `Sáb: ${storeData.store.operation.saturday}`,
    },
    storeData.store.operation.sunday && {
      label: `Dom: ${storeData.store.operation.sunday}`,
    },
    storeData.contact?.phone && {
      label: `Telefone: ${storeData.contact.phone}`,
    },
    storeData.contact?.email && {
      label: `Email: ${storeData.contact.email}`,
    },
  ].filter(Boolean) as { label: string }[];

  const deliveryItems = [
    storeData.store.deliveryMethods.pickOnStore
      ? { label: "Retire na loja sem fila" }
      : null,
    storeData.store.deliveryMethods.motoBoy
      ? { label: "Entrega via motoboy" }
      : null,
    storeData.store.deliveryMethods.ownVehicle
      ? { label: "Entrega com frota própria" }
      : null,
  ].filter(Boolean) as { label: string }[];

  const socialItems = [
    storeData.social_medias?.instagram && {
      href: storeData.social_medias.instagram,
      iconName: "instagram",
    },
    storeData.social_medias?.facebook && {
      href: storeData.social_medias.facebook,
      iconName: "facebook",
    },
  ].filter(Boolean) as { href: string; iconName: "instagram" | "facebook" }[];

  const cityState = [storeData.address?.city, storeData.address?.state]
    .filter(Boolean)
    .join(" - ");
  const addressLine = [storeData.address?.street, cityState]
    .filter(Boolean)
    .join(", ");
  const addressText = storeData.address?.zipCode
    ? `${addressLine} — CEP: ${storeData.address.zipCode}`
    : addressLine;
  const phoneDigits = (storeData.contact?.phone ?? "").replace(/\D/g, "");
  const whatsappDigits = (storeData.contact?.whatsapp ?? "").replace(/\D/g, "");
  const mapAddress = [
    storeData.address?.street,
    storeData.address?.city,
    storeData.address?.state,
    storeData.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
  const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapAddress || addressLine || "João Monlevade MG",
  )}`;
  const contactCards = [
    phoneDigits
      ? {
          id: "phone",
          label: storeData.contact?.phone ?? "(31) 98518-7963",
          href: `tel:${phoneDigits}`,
          Icon: PhoneCallIcon,
        }
      : null,
    whatsappDigits
      ? {
          id: "whatsapp",
          label: `WhatsApp ${storeData.contact?.phone ?? "(31) 98518-7963"}`,
          href: `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
            `Olá, quero falar com a equipe da ${storeData.store.name}.`,
          )}`,
          Icon: WhatsappLogoIcon,
          external: true,
        }
      : null,
    storeData.contact?.email
      ? {
          id: "email",
          label: storeData.contact.email,
          href: `mailto:${storeData.contact.email}`,
          Icon: EnvelopeSimpleIcon,
        }
      : null,
    addressLine
      ? {
          id: "address",
          label: addressLine,
          href: googleMapsHref,
          Icon: MapPinIcon,
          external: true,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    href: string;
    Icon: ElementType;
    external?: boolean;
  }[];
  const footerYear = new Date().getFullYear();

  return (
    <>
      <Section
        id="contato"
        className="bg-[linear-gradient(180deg,#f7f6f2_0%,#f3f2ee_100%)] py-16 sm:py-20"
        containerClassName="gap-10"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Title as="h2" className="mt-0">
            Contato
          </Title>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <Title as="h3" className="mt-0 !text-2xl">
              Informações de contato
            </Title>

            <div className="grid gap-4">
              {contactCards.map((item) => {
                const IconComponent = item.Icon;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className="group flex min-h-[76px] items-center gap-4 rounded-[24px] border border-border-card/50 bg-white px-5 py-4 shadow-[0_12px_28px_rgba(32,24,18,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(32,24,18,0.10)]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                      <IconComponent weight="fill" className="h-7 w-7" />
                    </span>
                    <span className="min-w-0 break-words text-sm font-medium text-foreground sm:text-base">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>

          </div>

          <div className="flex flex-col gap-6">
            <Title as="h3" className="mt-0 !text-2xl">
              Onde estamos
            </Title>

            {/* @ts-ignore */}
            <GoogleMapsRender
              address={mapAddress || addressLine}
              title={`Mapa da ${storeData.store.name}`}
              aspect="4:3"
              borderRadius={28}
              minHeight={420}
              containerClassName="w-full"
            />
          </div>
        </div>
      </Section>

      <FooterRC.Root bordered className="bg-white">
        <FooterRC.Top columns={4}>
          <FooterRC.Column items={institutionalItems} title="Navegação" />
          <FooterRC.Column items={supportItems} title="Atendimento" />
          <FooterRC.Column items={deliveryItems} title="Entregas" />
          <FooterRC.Column
            items={[
              {
                imageUrl: "/lets_encrypt.png",
                label: "Pagamento protegido",
              },
            ]}
            title="Site seguro"
          />
        </FooterRC.Top>
        <FooterRC.SocialRow
          title="Acompanhe a MonlevadePizzas"
          iconsClassName="text-foreground/70 hover:text-foreground"
          iconsWeight="fill"
          items={socialItems}
          className="bg-white"
        />
        <FooterRC.Bottom>
          <div className="mb-4 flex w-full flex-col gap-4 break-words">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <p>
                © {footerYear} {storeData.store.name} — CNPJ:{" "}
                {storeData.legal?.cnpj}
              </p>
              <p className="text-foreground/70">{addressText}</p>
            </div>
            <p className="text-xs text-foreground/60">
              Cardápio virtual de referência com dados mockados para template
              UI.
            </p>
          </div>
        </FooterRC.Bottom>
      </FooterRC.Root>
    </>
  );
}
