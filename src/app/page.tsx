"use client";

import {
  ArrowRightIcon,
  ListIcon,
  MotorcycleIcon,
  PizzaIcon,
  TimerIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BannerCarousel,
  CategoryCard,
  ProductCard,
} from "../libs/react-ultimate-components/src";
import {
  landingInfos,
  menuCategories,
  menuProducts,
  promoBanners,
} from "../mock";
import type { MenuCategorySlug } from "../mock/categories";
import { splitIngredientsList } from "../utils/format";
import { sendMessageWhatsapp } from "../utils/helpers";
import {
  FadeContainer,
  InfoIcon,
  RevealContainer,
  Section,
  Subtitle,
  Title,
  ZoomContainer,
} from "./components/ui";
import { useOrderCart } from "./providers/OrderCartProvider";
import { useStore } from "./providers/StoreProvider";

type CategoryFilter = "todos" | MenuCategorySlug;

const PROMO_DEADLINE = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
const PIZZA_CATEGORY_SLUGS = new Set<MenuCategorySlug>([
  "pizzas-salgadas",
  "pizzas-doces",
  "borda-recheada",
]);

const INFO_ICON_BY_KEY = {
  timer: TimerIcon,
  delivery: MotorcycleIcon,
  menu: PizzaIcon,
} as const;

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("todos");
  const router = useRouter();
  const { addPizzaOrder } = useOrderCart();
  const { storeData } = useStore();

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "todos") {
      return menuProducts;
    }

    return menuProducts.filter(
      (product) => product.categorySlug === selectedCategory,
    );
  }, [selectedCategory]);

  const selectedCategoryData =
    selectedCategory === "todos"
      ? null
      : (menuCategories.find(
          (category) => category.slug === selectedCategory,
        ) ?? null);

  const heroSlides = useMemo(
    () =>
      promoBanners.map((banner, index) => (
        <div key={banner.id} className="relative h-full w-full py-32">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover min-h-[600px]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,10,7,0.86)_0%,rgba(26,10,7,0.55)_52%,rgba(26,10,7,0.12)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.35)_100%)]" />
          <div className="relative mx-auto flex h-ful max-w-5xl justify-center items-center px-4 sm:px-6 w-[75vw] lg:w-full">
            <FadeContainer once className="max-w-2xl sm:max-w-5xl">
              <Title
                as="h1"
                className="mt-5 line-clamp-3 text-[2.05rem] leading-[1.05] text-white sm:text-[2.85rem] lg:text-[3.5rem]"
              >
                {banner.title}
              </Title>
              <Subtitle className="mt-4 max-w-xl line-clamp-3 text-base text-white/75 sm:text-lg">
                {banner.subtitle}
              </Subtitle>
              <a
                href={`#${banner.targetId}`}
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-600"
              >
                <span>Quero aproveitar</span>
                <ArrowRightIcon weight="bold" className="h-4 w-4" />
              </a>
            </FadeContainer>
          </div>
        </div>
      )),
    [],
  );

  const handleCategorySelection = (category: CategoryFilter) => {
    setSelectedCategory(category);
    document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWhatsappOrder = (productName?: string) => {
    const baseMessage = productName
      ? `Olá, quero pedir ${productName} na MonlevadePizzas.`
      : "Olá, quero montar um pedido na MonlevadePizzas.";

    sendMessageWhatsapp(
      baseMessage,
      storeData.contact?.whatsapp ?? "5531985187963",
    );
  };

  return (
    <main
      id="topo"
      className="min-h-screen w-full bg-background text-foreground"
    >
      <BannerCarousel
        items={heroSlides}
        showDots
        loop
        autoplay
        className="w-full"
      />

      <Section id="cardapio" className="bg-white" containerClassName="gap-6">
        <FadeContainer once className="flex justify-center items-center mx-auto gap-3">
          <ListIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          <Subtitle
            as="span"
            className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-center mx-auto text-black w-fit mt-1"
          >
            Cardápio
          </Subtitle>
        </FadeContainer>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCategorySelection("todos")}
            className={[
              "rounded-full border px-5 py-3 text-sm font-semibold transition",
              selectedCategory === "todos"
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-border-card bg-bg-card text-foreground hover:bg-foreground/5",
            ].join(" ")}
          >
            Todas as opções
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {menuCategories.map((category, index) => (
            <ZoomContainer key={category.id} once delayMs={index * 55}>
              <CategoryCard
                name={category.name}
                imgUrl={category.image}
                className={[
                  "h-full",
                  selectedCategory === category.slug
                    ? "!border-primary-500 ring-2 ring-primary-300/60"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onSeeCategory={() => handleCategorySelection(category.slug)}
              />
            </ZoomContainer>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product, index) => {
            const isPizzaProduct = PIZZA_CATEGORY_SLUGS.has(product.categorySlug);

            return (
              <ZoomContainer
                key={product.id}
                once={index < 6}
                delayMs={(index % 3) * 65}
              >
                <div className="flex h-full flex-col gap-3">
                  <ProductCard
                    productId={product.id}
                    imageUrl={product.image}
                    title={product.name}
                    price={product.price}
                    productDescription={product.ingredientes}
                    ingredients={splitIngredientsList(product.ingredientes)}
                    rating={product.rating}
                    ctaLabel={
                      isPizzaProduct ? "Adicionar ao pedido" : "Tenho interesse"
                    }
                    className="h-full"
                    enablePizzaOrderAssistant={isPizzaProduct}
                    onPizzaOrderFinish={(order) =>
                      addPizzaOrder(
                        {
                          productId: product.id,
                          title: product.name,
                          imageUrl: product.image,
                        },
                        order
                      )
                    }
                    onAddToCart={
                      isPizzaProduct
                        ? undefined
                        : () => handleWhatsappOrder(product.name)
                    }
                    onSeeProductDetails={() =>
                      router.push(`/produto/${product.slug}`)
                    }
                  />
                </div>
              </ZoomContainer>
            );
          })}
        </div>
      </Section>

   

      <Section
        id="sobre"
        className="bg-secondary-500 py-16 sm:py-20 flex"
        containerClassName="gap-10 flex w-full"
      >
        <div className="w-full flex flex-col xl:flex-row gap-12">
          <div className="flex flex-col w-full gap-8">
            <RevealContainer once className="w-full flex flex-col items-center xl:items-start text-center xl:text-left">
              <Title as="h2" className="lg:max-w-2xl">
                Sobre nós
              </Title>
              <Subtitle className="mt-5 w-full lg-max-w-xl !text-lg !sm:text-2xl">
                A {storeData.store.name} reúne pizzas salgadas, pizzas doces,
                bordas recheadas, burguers artesanais e croissants. Faça seu
                pedido e receba no conforto da sua casa.
              </Subtitle>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#categorias"
                  className="inline-flex rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
                >
                  Ver cardápio
                </a>
              </div>
            </RevealContainer>
          </div>

          <div className="w-full">
            <FadeContainer once delayMs={120}>
              <div className="flex flex-col sm:flex-row items-center gap-12">
                {landingInfos.map((infoItem) => {
                  const IconComponent = INFO_ICON_BY_KEY[infoItem.icon];

                  return (
                    <InfoIcon
                      key={infoItem.id}
                      icon={
                        <IconComponent
                          weight="fill"
                          className="h-12 w-12 sm:h-16 sm:w-16"
                          aria-hidden="true"
                        />
                      }
                      title={infoItem.title}
                    />
                  );
                })}
              </div>
            </FadeContainer>
          </div>
        </div>
      </Section>
    </main>
  );
}
