"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  XIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { Modal } from "react-responsive-modal";
import { useEffect, useId, useMemo, useState } from "react";
import CartCard, {
  type Product as CartProduct,
} from "../../cards/CartCard/index";
import NavigationCard from "../../cards/NavigationCard/index";
import RadioGroupInput, {
  type Option,
} from "../../inputs/RadioGroupInput/index";
import TextAreaInput from "../../inputs/TextAreaInput/index";
import { formatBRL } from "../../../utils/format";
import {
  defaultOrderAssistentCandies,
  defaultOrderAssistentDrinks,
  type OrderAssistentAdditionalOption,
} from "./data";

type ModalSize = "lg" | "xl" | "2xl";

interface SelectedAdditionalOption extends OrderAssistentAdditionalOption {
  quantity: number;
}

export interface OrderAssistentOrder {
  foodName: string;
  foodDescription?: string;
  foodIngredients: string[];
  candies: SelectedAdditionalOption[];
  drinks: SelectedAdditionalOption[];
  observation: string;
  wantsCandies: boolean;
  wantsDrinks: boolean;
  wantsObservation: boolean;
  foodBasePrice: number;
  totalPrice: number;
}

export interface OrderAssistentModalProps {
  open: boolean;
  onClose: () => void;
  onFinish?: (order: OrderAssistentOrder) => void;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  resetOnOpen?: boolean;
  isSubmitting?: boolean;
  size?: ModalSize;
  title?: string;
  description?: string;
  finalizeButtonLabel?: string;
  continueButtonLabel?: string;
  backButtonLabel?: string;
  showOrderSummary?: boolean;
  foodName?: string;
  foodDescription?: string;
  foodIngredients?: string[];
  foodBasePrice?: number;
  candyOptions?: OrderAssistentAdditionalOption[];
  drinkOptions?: OrderAssistentAdditionalOption[];
  defaultCandyQuantities?: Record<string, number>;
  defaultDrinkQuantities?: Record<string, number>;
  defaultObservation?: string;
  stepLabels?: string[];
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  closeButtonClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  progressWrapperClassName?: string;
  progressItemClassName?: string;
  progressItemActiveClassName?: string;
  progressItemCompletedClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  summaryClassName?: string;
  summaryTitleClassName?: string;
  summarySectionClassName?: string;
  summaryRowClassName?: string;
  summaryValueClassName?: string;
  sectionClassName?: string;
  sectionHeaderClassName?: string;
  sectionTitleClassName?: string;
  sectionDescriptionClassName?: string;
  helperCardClassName?: string;
  helperTitleClassName?: string;
  helperDescriptionClassName?: string;
  radioGroupContainerClassName?: string;
  textAreaContainerClassName?: string;
  optionsScrollAreaClassName?: string;
  navigationClassName?: string;
  advanceButtonClassName?: string;
  backButtonClassName?: string;
  cartCardClassName?: string;
  cartCardListClassName?: string;
  cartCardItemClassName?: string;
  cartCardItemNameClassName?: string;
  cartCardItemDescriptionClassName?: string;
  cartCardItemBadgeClassName?: string;
  cartCardItemPriceClassName?: string;
}

interface InitialState {
  wantsCandies: boolean | null;
  candyProducts: CartProduct[];
  wantsDrinks: boolean | null;
  drinkProducts: CartProduct[];
  wantsObservation: boolean | null;
  observation: string;
}

const STEP_IDS = ["bebidas", "doces", "observacoes", "finalizacao"] as const;

const sizeMap: Record<ModalSize, string> = {
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
};

const createCartProducts = <
  T extends {
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    badge?: string;
  },
>(
  options: T[],
  quantityMap: Record<string, number>,
  maxQuantity: number,
) => {
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    price: option.price,
    quantity: Math.min(quantityMap[option.id] ?? 0, maxQuantity),
    imageUrl: option.imageUrl,
    description: option.description,
    badge: option.badge,
    maxQuantity,
    minQuantity: 0,
  }));
};

const mergeUpdatedProducts = (
  previousProducts: CartProduct[],
  updatedProducts: CartProduct[],
) => {
  const updatedProductMap = new Map(
    updatedProducts.map((item) => [item.id, item]),
  );

  return previousProducts.map((product) => {
    return updatedProductMap.get(product.id) ?? product;
  });
};

const getQuantityMapFromRecord = (record: Record<string, number>) => {
  return Object.entries(record).reduce<Record<string, number>>(
    (acc, [id, qty]) => {
      acc[id] = Math.max(0, qty);
      return acc;
    },
    {},
  );
};

const createInitialState = ({
  candyOptions,
  drinkOptions,
  defaultCandyQuantities,
  defaultDrinkQuantities,
  defaultObservation,
}: {
  candyOptions: OrderAssistentAdditionalOption[];
  drinkOptions: OrderAssistentAdditionalOption[];
  defaultCandyQuantities?: Record<string, number>;
  defaultDrinkQuantities?: Record<string, number>;
  defaultObservation?: string;
}): InitialState => {
  return {
    wantsCandies:
      Object.keys(defaultCandyQuantities ?? {}).length > 0 ? true : null,
    candyProducts: createCartProducts(
      candyOptions,
      getQuantityMapFromRecord(defaultCandyQuantities ?? {}),
      10,
    ),
    wantsDrinks:
      Object.keys(defaultDrinkQuantities ?? {}).length > 0 ? true : null,
    drinkProducts: createCartProducts(
      drinkOptions,
      getQuantityMapFromRecord(defaultDrinkQuantities ?? {}),
      2,
    ),
    wantsObservation: defaultObservation?.trim() ? true : null,
    observation: defaultObservation ?? "",
  };
};

const toBooleanOptions = (
  yesLabel: string,
  yesDescription: string,
  noLabel: string,
  noDescription: string,
): Option[] => [
  {
    label: yesLabel,
    value: "sim",
    description: yesDescription,
  },
  {
    label: noLabel,
    value: "nao",
    description: noDescription,
  },
];

export default function OrderAssistentModal({
  open,
  onClose,
  onFinish,
  closeOnOverlayClick = true,
  showCloseButton = true,
  resetOnOpen = false,
  isSubmitting = false,
  size = "xl",
  title = "Assistente de pedido",
  description = "Adicione bebidas, doces e observações ao seu pedido em poucos passos.",
  finalizeButtonLabel = "Finalizar pedido",
  continueButtonLabel = "Continuar",
  backButtonLabel = "Voltar",
  showOrderSummary = false,
  foodName = "Item da casa",
  foodDescription = "",
  foodIngredients = [],
  foodBasePrice = 0,
  candyOptions = defaultOrderAssistentCandies,
  drinkOptions = defaultOrderAssistentDrinks,
  defaultCandyQuantities,
  defaultDrinkQuantities,
  defaultObservation,
  stepLabels,
  className,
  overlayClassName,
  containerClassName,
  closeButtonClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  contentClassName,
  summaryClassName,
  summaryTitleClassName,
  summarySectionClassName,
  summaryRowClassName,
  summaryValueClassName,
  sectionClassName,
  sectionHeaderClassName,
  sectionTitleClassName,
  sectionDescriptionClassName,
  helperCardClassName,
  helperTitleClassName,
  helperDescriptionClassName,
  radioGroupContainerClassName,
  textAreaContainerClassName,
  optionsScrollAreaClassName,
  navigationClassName,
  advanceButtonClassName,
  backButtonClassName,
  cartCardClassName,
  cartCardListClassName,
  cartCardItemClassName,
  cartCardItemNameClassName,
  cartCardItemDescriptionClassName,
  cartCardItemBadgeClassName,
  cartCardItemPriceClassName,
}: OrderAssistentModalProps) {
  const radioGroupBaseName = useId();
  const initialState = useMemo(
    () =>
      createInitialState({
        candyOptions,
        drinkOptions,
        defaultCandyQuantities,
        defaultDrinkQuantities,
        defaultObservation,
      }),
    [
      candyOptions,
      defaultCandyQuantities,
      defaultDrinkQuantities,
      defaultObservation,
      drinkOptions,
    ],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [wantsCandies, setWantsCandies] = useState<boolean | null>(
    initialState.wantsCandies,
  );
  const [candyProducts, setCandyProducts] = useState<CartProduct[]>(
    initialState.candyProducts,
  );
  const [wantsDrinks, setWantsDrinks] = useState<boolean | null>(
    initialState.wantsDrinks,
  );
  const [drinkProducts, setDrinkProducts] = useState<CartProduct[]>(
    initialState.drinkProducts,
  );
  const [wantsObservation, setWantsObservation] = useState<boolean | null>(
    initialState.wantsObservation,
  );
  const [observation, setObservation] = useState(initialState.observation);

  useEffect(() => {
    if (!open || !resetOnOpen) return;

    setCurrentStep(0);
    setWantsCandies(initialState.wantsCandies);
    setCandyProducts(initialState.candyProducts);
    setWantsDrinks(initialState.wantsDrinks);
    setDrinkProducts(initialState.drinkProducts);
    setWantsObservation(initialState.wantsObservation);
    setObservation(initialState.observation);
  }, [initialState, open, resetOnOpen]);

  const candyOptionMap = useMemo(
    () => new Map(candyOptions.map((option) => [option.id, option])),
    [candyOptions],
  );
  const drinkOptionMap = useMemo(
    () => new Map(drinkOptions.map((option) => [option.id, option])),
    [drinkOptions],
  );

  const resolvedStepLabels = [
    stepLabels?.[0] ?? "Bebidas",
    stepLabels?.[1] ?? "Doces",
    stepLabels?.[2] ?? "Observações",
    stepLabels?.[3] ?? "Finalizar",
  ];

  const steps = useMemo(
    () => [
      {
        id: STEP_IDS[0],
        label: resolvedStepLabels[0],
        title: "Quer adicionar algo para beber?",
        description:
          "Escolha bebidas para acompanhar o item selecionado. Cada bebida pode ter até 2 unidades.",
      },
      {
        id: STEP_IDS[1],
        label: resolvedStepLabels[1],
        title: "Deseja incluir um doce no pedido?",
        description:
          "Sobremesas rápidas ajudam a completar o pedido sem sair do fluxo.",
      },
      {
        id: STEP_IDS[2],
        label: resolvedStepLabels[2],
        title: "Gostaria de deixar alguma observação?",
        description:
          "Use este campo apenas para instruções importantes do preparo ou da entrega.",
      },
      {
        id: STEP_IDS[3],
        label: resolvedStepLabels[3],
        title: "Revise o pedido antes de finalizar",
        description:
          "Confira os itens adicionais selecionados e conclua quando estiver tudo certo.",
      },
    ],
    [resolvedStepLabels],
  );

  const currentStepDefinition = steps[currentStep];

  const selectedCandies = useMemo(() => {
    return candyProducts
      .filter((product) => product.quantity > 0)
      .map((product) => {
        const option = candyOptionMap.get(product.id);
        if (!option) return null;
        return {
          ...option,
          quantity: product.quantity,
        };
      })
      .filter(Boolean) as SelectedAdditionalOption[];
  }, [candyOptionMap, candyProducts]);

  const selectedDrinks = useMemo(() => {
    return drinkProducts
      .filter((product) => product.quantity > 0)
      .map((product) => {
        const option = drinkOptionMap.get(product.id);
        if (!option) return null;
        return {
          ...option,
          quantity: product.quantity,
        };
      })
      .filter(Boolean) as SelectedAdditionalOption[];
  }, [drinkOptionMap, drinkProducts]);

  const candiesPrice = selectedCandies.reduce(
    (sum, candy) => sum + candy.price * candy.quantity,
    0,
  );
  const drinksPrice = selectedDrinks.reduce(
    (sum, drink) => sum + drink.price * drink.quantity,
    0,
  );
  const totalPrice = foodBasePrice + candiesPrice + drinksPrice;

  const orderPayload: OrderAssistentOrder = {
    foodName,
    foodDescription,
    foodIngredients,
    candies: selectedCandies,
    drinks: selectedDrinks,
    observation: wantsObservation ? observation.trim() : "",
    wantsCandies: wantsCandies ?? false,
    wantsDrinks: wantsDrinks ?? false,
    wantsObservation: wantsObservation ?? false,
    foodBasePrice,
    totalPrice,
  };

  const isCurrentStepValid = useMemo(() => {
    switch (currentStepDefinition.id) {
      case "bebidas":
        return wantsDrinks !== null;
      case "doces":
        return wantsCandies !== null;
      case "observacoes":
        return (
          wantsObservation !== null &&
          (!wantsObservation || observation.trim().length > 0)
        );
      case "finalizacao":
        return !isSubmitting;
      default:
        return false;
    }
  }, [
    currentStepDefinition.id,
    isSubmitting,
    observation,
    wantsCandies,
    wantsDrinks,
    wantsObservation,
  ]);

  const handleAdvance = () => {
    if (currentStep === steps.length - 1) {
      onFinish?.(orderPayload);
      return;
    }

    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, steps.length - 1),
    );
  };

  const handleBack = () => {
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
  };

  const updateCandyProducts = (updatedProducts: CartProduct[]) => {
    setCandyProducts((previousProducts) =>
      mergeUpdatedProducts(previousProducts, updatedProducts),
    );
  };

  const updateDrinkProducts = (updatedProducts: CartProduct[]) => {
    setDrinkProducts((previousProducts) =>
      mergeUpdatedProducts(previousProducts, updatedProducts),
    );
  };

  const renderSectionHeader = (
    titleValue: string,
    descriptionValue: string,
  ) => (
    <div className={clsx("space-y-1", sectionHeaderClassName)}>
      <h3
        className={clsx(
          "text-lg font-semibold tracking-tight text-foreground sm:text-xl",
          sectionTitleClassName,
        )}
      >
        {titleValue}
      </h3>
      <p
        className={clsx(
          "text-sm leading-relaxed text-foreground/65 sm:text-base",
          sectionDescriptionClassName,
        )}
      >
        {descriptionValue}
      </p>
    </div>
  );

  const renderHelperCard = (titleValue: string, descriptionValue: string) => (
    <div
      className={clsx(
        "rounded-2xl border border-primary-500/15 bg-primary-500/5 p-4",
        helperCardClassName,
      )}
    >
      <p
        className={clsx(
          "text-sm font-semibold text-foreground",
          helperTitleClassName,
        )}
      >
        {titleValue}
      </p>
      <p
        className={clsx(
          "mt-1 text-sm leading-relaxed text-foreground/65",
          helperDescriptionClassName,
        )}
      >
        {descriptionValue}
      </p>
    </div>
  );

  const scrollableOptionsClassName = clsx(
    "max-h-[20vh] overflow-y-auto pr-1",
    optionsScrollAreaClassName,
  );

  const selectedItemDescription = foodDescription?.trim() || foodName;

  const renderBebidasStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-bebidas-preferencia`}
        label="Deseja adicionar bebidas?"
        options={toBooleanOptions(
          "Sim, quero bebidas",
          "Você pode selecionar até 2 unidades por bebida.",
          "Não, vou finalizar sem bebidas",
          "Seguimos para os doces.",
        )}
        value={wantsDrinks === null ? null : wantsDrinks ? "sim" : "nao"}
        onSelectOption={(option) => {
          const nextValue = option.value === "sim";
          setWantsDrinks(nextValue);
          if (!nextValue) {
            setDrinkProducts((previousProducts) =>
              previousProducts.map((product) => ({ ...product, quantity: 0 })),
            );
          }
        }}
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
      />

      {wantsDrinks ? (
        <CartCard
          products={drinkProducts}
          onProductsChange={updateDrinkProducts}
          title="Bebidas disponíveis"
          description="Cada bebida pode ter até 2 unidades por pedido."
          emptyCartCardMessage="Nenhuma bebida disponível no momento."
          className={cartCardClassName}
          listClassName={clsx(
            scrollableOptionsClassName,
            cartCardListClassName,
          )}
          itemClassName={cartCardItemClassName}
          itemNameClassName={cartCardItemNameClassName}
          itemDescriptionClassName={cartCardItemDescriptionClassName}
          itemBadgeClassName={cartCardItemBadgeClassName}
          itemPriceClassName={cartCardItemPriceClassName}
          keepZeroQuantityItems
          showRemoveButton={false}
          priceMode="unit"
          isIncreaseDisabled={(product) => product.quantity >= 2}
          isDecreaseDisabled={(product) => product.quantity <= 0}
          priceFormatter={(product) => `+ ${formatBRL(product.price)}`}
        />
      ) : null}
    </div>
  );

  const renderDocesStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-doces-preferencia`}
        label="Deseja incluir algum doce?"
        options={toBooleanOptions(
          "Sim, quero um doce",
          "Você pode selecionar até 10 unidades por item.",
          "Não, vou ficar só com o item principal",
          "Seguimos para as observações.",
        )}
        value={wantsCandies === null ? null : wantsCandies ? "sim" : "nao"}
        onSelectOption={(option) => {
          const nextValue = option.value === "sim";
          setWantsCandies(nextValue);
          if (!nextValue) {
            setCandyProducts((previousProducts) =>
              previousProducts.map((product) => ({ ...product, quantity: 0 })),
            );
          }
        }}
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
      />

      {wantsCandies ? (
        <CartCard
          products={candyProducts}
          onProductsChange={updateCandyProducts}
          title="Doces disponíveis"
          description="Cada item pode ter até 10 unidades."
          emptyCartCardMessage="Nenhum doce disponível no momento."
          className={cartCardClassName}
          listClassName={clsx(
            scrollableOptionsClassName,
            cartCardListClassName,
          )}
          itemClassName={cartCardItemClassName}
          itemNameClassName={cartCardItemNameClassName}
          itemDescriptionClassName={cartCardItemDescriptionClassName}
          itemBadgeClassName={cartCardItemBadgeClassName}
          itemPriceClassName={cartCardItemPriceClassName}
          keepZeroQuantityItems
          showRemoveButton={false}
          priceMode="unit"
          isIncreaseDisabled={(product) => product.quantity >= 10}
          isDecreaseDisabled={(product) => product.quantity <= 0}
          priceFormatter={(product) => `+ ${formatBRL(product.price)}`}
        />
      ) : null}
    </div>
  );

  const renderObservacoesStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-observacao-preferencia`}
        label="Deseja deixar alguma observação?"
        options={toBooleanOptions(
          "Sim, quero adicionar uma observação",
          "Exemplos: ponto da carne, retirar algum item, enviar sem cortar ou informar referência.",
          "Não, está tudo certo",
          "Fechamos o pedido sem observações adicionais.",
        )}
        value={
          wantsObservation === null ? null : wantsObservation ? "sim" : "nao"
        }
        onSelectOption={(option) => {
          const nextValue = option.value === "sim";
          setWantsObservation(nextValue);
          if (!nextValue) {
            setObservation("");
          }
        }}
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
      />

      {wantsObservation ? (
        <TextAreaInput
          id={`${radioGroupBaseName}-observacao`}
          label="Qual é a sua observação?"
          placeholder="Ex.: tirar cebola, mandar sem guardanapo ou informar bloco/apto."
          maxTextLength={280}
          currentTextLength={observation.length}
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          helperText="Para avançar, escreva pelo menos uma observação válida."
          containerClassName={textAreaContainerClassName}
        />
      ) : null}
    </div>
  );

  const renderFinalizacaoStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <div
        className={clsx(
          "grid max-h-[20vh] gap-4 overflow-y-auto pr-1",
          optionsScrollAreaClassName,
        )}
      >
        {renderHelperCard("Item principal", selectedItemDescription)}

        {foodIngredients.length > 0
          ? renderHelperCard("Composição", foodIngredients.join(" • "))
          : null}

        {selectedDrinks.length > 0
          ? renderHelperCard(
              "Bebidas",
              selectedDrinks
                .map(
                  (drink) =>
                    `${drink.quantity}x ${drink.name} (${formatBRL(
                      drink.price * drink.quantity,
                    )})`,
                )
                .join(" • "),
            )
          : null}

        {selectedCandies.length > 0
          ? renderHelperCard(
              "Doces",
              selectedCandies
                .map(
                  (candy) =>
                    `${candy.quantity}x ${candy.name} (${formatBRL(
                      candy.price * candy.quantity,
                    )})`,
                )
                .join(" • "),
            )
          : null}

        {wantsObservation && observation.trim()
          ? renderHelperCard("Observacao", observation.trim())
          : null}
      </div>
    </div>
  );

  const summarySections = [
    {
      label: "Item",
      value: foodName,
      price: foodBasePrice,
    },
    {
      label: "Bebidas",
      value:
        selectedDrinks.length > 0
          ? `${selectedDrinks.reduce((sum, drink) => sum + drink.quantity, 0)} item(ns)`
          : "Sem bebidas",
      price: drinksPrice,
    },
    {
      label: "Doces",
      value:
        selectedCandies.length > 0
          ? `${selectedCandies.reduce((sum, candy) => sum + candy.quantity, 0)} item(ns)`
          : "Sem doces",
      price: candiesPrice,
    },
  ];

  const renderCurrentStep = () => {
    switch (currentStepDefinition.id) {
      case "bebidas":
        return renderBebidasStep();
      case "doces":
        return renderDocesStep();
      case "observacoes":
        return renderObservacoesStep();
      case "finalizacao":
        return renderFinalizacaoStep();
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      center
      closeOnOverlayClick={closeOnOverlayClick}
      showCloseIcon={showCloseButton}
      closeIcon={<XIcon size={20} weight="bold" />}
      classNames={{
        overlay: clsx("bg-black/55 backdrop-blur-[3px]", overlayClassName),
        modal: clsx(
          "!m-0 !bg-transparent !p-0",
          "w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)]",
          containerClassName,
        ),
        closeButton: clsx(
          "right-3 top-3 text-foreground/70 hover:text-foreground",
          closeButtonClassName,
        ),
      }}
      styles={{
        modal: {
          background: "transparent",
          padding: 0,
          margin: 0,
          boxShadow: "none",
        },
      }}
      focusTrapped
      blockScroll
    >
      <div
        className={clsx(
          "w-full overflow-hidden rounded-[28px] border border-border-card/80 bg-background text-foreground shadow-2xl",
          "bg-[radial-gradient(circle_at_top,_rgba(199,73,30,0.12),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(255,255,255,1))]",
          "dark:bg-[radial-gradient(circle_at_top,_rgba(199,73,30,0.18),_transparent_40%),linear-gradient(180deg,_rgba(14,14,14,0.98),_rgba(10,10,10,1))]",
          sizeMap[size],
          className,
        )}
      >
        <div
          className={clsx(
            "border-b border-border-card/70 px-4 py-5 sm:px-6",
            headerClassName,
          )}
        >
          <div className="flex items-start gap-4">
            <span className="mt-1 inline-flex rounded-2xl bg-primary-500/10 p-3 text-primary-600">
              <ShoppingCartIcon size={22} weight="fill" />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
                Pedido guiado
              </span>
              <h2
                className={clsx(
                  "mt-2 text-xl font-semibold tracking-tight sm:text-2xl",
                  titleClassName,
                )}
              >
                {title}
              </h2>
              <p
                className={clsx(
                  "mt-2 text-sm leading-relaxed text-foreground/65 sm:text-base",
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "flex flex-col items-center w-full gap-6 px-4 py-5 sm:px-6",
            bodyClassName,
          )}
        >
          <div className={clsx("space-y-6 w-full", contentClassName)}>
            {renderCurrentStep()}

            <NavigationCard
              onAdvance={handleAdvance}
              onBack={handleBack}
              advanceLabel={
                currentStep === steps.length - 1
                  ? finalizeButtonLabel
                  : continueButtonLabel
              }
              backLabel={backButtonLabel}
              advanceIcon={
                currentStep === steps.length - 1 ? (
                  <ShoppingCartIcon size={16} weight="bold" />
                ) : (
                  <ArrowRightIcon size={16} weight="bold" />
                )
              }
              backIcon={<ArrowLeftIcon size={16} weight="bold" />}
              advanceDisabled={!isCurrentStepValid || isSubmitting}
              backDisabled={currentStep === 0 || isSubmitting}
              className={navigationClassName}
              advanceButtonClassName={advanceButtonClassName}
              backButtonClassName={backButtonClassName}
            />
          </div>

          {showOrderSummary ? (
            <aside
              className={clsx(
                "h-fit rounded-[24px] border border-border-card bg-bg-card/80 p-5 shadow-sm lg:sticky lg:top-4",
                summaryClassName,
              )}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-primary-500/10 p-3 text-primary-600">
                  <ShoppingCartIcon size={20} weight="fill" />
                </span>
                <div>
                  <h4
                    className={clsx(
                      "text-base font-semibold",
                      summaryTitleClassName,
                    )}
                  >
                    Resumo do pedido
                  </h4>
                  <p className="text-sm text-foreground/65">
                    Atualizado em tempo real a cada etapa.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {summarySections.map((section) => (
                  <div
                    key={section.label}
                    className={clsx(
                      "rounded-2xl border border-border-card/70 bg-background/70 p-4",
                      summarySectionClassName,
                    )}
                  >
                    <div
                      className={clsx(
                        "flex items-start justify-between gap-3",
                        summaryRowClassName,
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
                          {section.label}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">
                          {section.value}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          "shrink-0 text-sm font-semibold text-primary-600",
                          summaryValueClassName,
                        )}
                      >
                        {section.price > 0
                          ? formatBRL(section.price)
                          : "R$ 0,00"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-primary-500/15 bg-primary-500/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
                  Total estimado
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {formatBRL(totalPrice)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                  O total considera o item principal, as bebidas e os doces
                  selecionados.
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export { defaultOrderAssistentCandies, defaultOrderAssistentDrinks };
export type { OrderAssistentAdditionalOption };
