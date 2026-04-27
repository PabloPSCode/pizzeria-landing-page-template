"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PizzaIcon,
  ShoppingCartIcon,
  XIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useId, useMemo, useState } from "react";
import { Modal } from "react-responsive-modal";
import { formatBRL } from "../../../utils/format";
import CartCard, {
  type Product as CartProduct,
} from "../../cards/CartCard/index";
import NavigationCard from "../../cards/NavigationCard/index";
import Checkbox from "../../forms/miscellaneous/Checkbox/index";
import RadioGroupInput, {
  type Option,
} from "../../inputs/RadioGroupInput/index";
import TextAreaInput from "../../inputs/TextAreaInput/index";
import {
  defaultPizzaOrderAssistentBorders,
  defaultPizzaOrderAssistentCandies,
  defaultPizzaOrderAssistentDrinks,
  defaultPizzaOrderAssistentFlavors,
  defaultPizzaOrderAssistentIngredients,
  type PizzaOrderAssistentAdditionalOption,
  type PizzaOrderAssistentBorderOption,
  type PizzaOrderAssistentFlavorOption,
  type PizzaOrderAssistentIngredientOption,
} from "./data";

type BorderPreference = "com-borda" | "sem-borda";
type FlavorMode = 1 | 2;
type ModalSize = "lg" | "xl" | "2xl";

interface SelectedAdditionalOption extends PizzaOrderAssistentAdditionalOption {
  quantity: number;
}

export interface PizzaOrderAssistentOrder {
  borderPreference: BorderPreference;
  borderOption: PizzaOrderAssistentBorderOption | null;
  flavorMode: FlavorMode;
  flavors: PizzaOrderAssistentFlavorOption[];
  extraIngredients: PizzaOrderAssistentIngredientOption[];
  candies: SelectedAdditionalOption[];
  drinks: SelectedAdditionalOption[];
  observation: string;
  wantsExtraIngredients: boolean;
  wantsCandies: boolean;
  wantsDrinks: boolean;
  wantsObservation: boolean;
  pizzaBasePrice: number;
  totalPrice: number;
}

export interface PizzaOrderAssistentModalProps {
  open: boolean;
  onClose: () => void;
  onFinish?: (order: PizzaOrderAssistentOrder) => void;
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
  borderOptions?: PizzaOrderAssistentBorderOption[];
  flavorOptions?: PizzaOrderAssistentFlavorOption[];
  ingredientOptions?: PizzaOrderAssistentIngredientOption[];
  candyOptions?: PizzaOrderAssistentAdditionalOption[];
  drinkOptions?: PizzaOrderAssistentAdditionalOption[];
  defaultBorderPreference?: BorderPreference | null;
  defaultBorderOptionId?: string | null;
  defaultFlavorMode?: FlavorMode | null;
  defaultFlavorIds?: string[];
  defaultIngredientIds?: string[];
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
  searchContainerClassName?: string;
  radioGroupContainerClassName?: string;
  checkboxGridClassName?: string;
  checkboxItemClassName?: string;
  checkboxLabelClassName?: string;
  checkboxDescriptionClassName?: string;
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
  borderPreference: BorderPreference | null;
  selectedBorderId: string | null;
  flavorMode: FlavorMode | null;
  flavorProducts: CartProduct[];
  wantsExtraIngredients: boolean | null;
  selectedIngredientIds: string[];
  wantsCandies: boolean | null;
  candyProducts: CartProduct[];
  wantsDrinks: boolean | null;
  drinkProducts: CartProduct[];
  wantsObservation: boolean | null;
  observation: string;
}

const STEP_IDS = [
  "borda",
  "sabores",
  "ingredientes",
  "doces",
  "bebidas",
  "observacoes",
  "finalizacao",
] as const;

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

const getQuantityMapFromIds = (ids: string[]) => {
  return ids.reduce<Record<string, number>>((acc, id) => {
    if (!acc[id]) acc[id] = 1;
    return acc;
  }, {});
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
  borderOptions,
  flavorOptions,
  ingredientOptions,
  candyOptions,
  drinkOptions,
  defaultBorderPreference,
  defaultBorderOptionId,
  defaultFlavorMode,
  defaultFlavorIds,
  defaultIngredientIds,
  defaultCandyQuantities,
  defaultDrinkQuantities,
  defaultObservation,
}: {
  borderOptions: PizzaOrderAssistentBorderOption[];
  flavorOptions: PizzaOrderAssistentFlavorOption[];
  ingredientOptions: PizzaOrderAssistentIngredientOption[];
  candyOptions: PizzaOrderAssistentAdditionalOption[];
  drinkOptions: PizzaOrderAssistentAdditionalOption[];
  defaultBorderPreference?: BorderPreference | null;
  defaultBorderOptionId?: string | null;
  defaultFlavorMode?: FlavorMode | null;
  defaultFlavorIds?: string[];
  defaultIngredientIds?: string[];
  defaultCandyQuantities?: Record<string, number>;
  defaultDrinkQuantities?: Record<string, number>;
  defaultObservation?: string;
}): InitialState => {
  const validBorderId = borderOptions.some(
    (option) => option.id === defaultBorderOptionId,
  )
    ? (defaultBorderOptionId ?? null)
    : null;
  const validFlavorIds = Array.from(
    new Set(
      (defaultFlavorIds ?? []).filter((id) =>
        flavorOptions.some((option) => option.id === id),
      ),
    ),
  ).slice(0, 2);
  const derivedFlavorMode =
    defaultFlavorMode ??
    (validFlavorIds.length === 2 ? 2 : validFlavorIds.length === 1 ? 1 : null);
  const validIngredientIds = (defaultIngredientIds ?? []).filter((id) =>
    ingredientOptions.some((option) => option.id === id),
  );

  return {
    borderPreference: defaultBorderPreference ?? null,
    selectedBorderId:
      defaultBorderPreference === "com-borda" ? validBorderId : null,
    flavorMode: derivedFlavorMode,
    flavorProducts: createCartProducts(
      flavorOptions,
      getQuantityMapFromIds(validFlavorIds.slice(0, derivedFlavorMode ?? 2)),
      1,
    ),
    wantsExtraIngredients: validIngredientIds.length > 0 ? true : null,
    selectedIngredientIds: validIngredientIds,
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

export default function PizzaOrderAssistentModal({
  open,
  onClose,
  onFinish,
  closeOnOverlayClick = true,
  showCloseButton = true,
  resetOnOpen = false,
  isSubmitting = false,
  size = "xl",
  title = "Assistente de pedido de pizza",
  finalizeButtonLabel = "Finalizar pedido",
  continueButtonLabel = "Continuar",
  backButtonLabel = "Voltar",
  showOrderSummary = false,
  borderOptions = defaultPizzaOrderAssistentBorders,
  flavorOptions = defaultPizzaOrderAssistentFlavors,
  ingredientOptions = defaultPizzaOrderAssistentIngredients,
  candyOptions = defaultPizzaOrderAssistentCandies,
  drinkOptions = defaultPizzaOrderAssistentDrinks,
  defaultBorderPreference,
  defaultBorderOptionId,
  defaultFlavorMode,
  defaultFlavorIds,
  defaultIngredientIds,
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
  progressWrapperClassName,
  progressItemClassName,
  progressItemActiveClassName,
  progressItemCompletedClassName,
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
  searchContainerClassName,
  radioGroupContainerClassName,
  checkboxGridClassName,
  checkboxItemClassName,
  checkboxLabelClassName,
  checkboxDescriptionClassName,
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
}: PizzaOrderAssistentModalProps) {
  const radioGroupBaseName = useId();
  const initialState = useMemo(
    () =>
      createInitialState({
        borderOptions,
        flavorOptions,
        ingredientOptions,
        candyOptions,
        drinkOptions,
        defaultBorderPreference,
        defaultBorderOptionId,
        defaultFlavorMode,
        defaultFlavorIds,
        defaultIngredientIds,
        defaultCandyQuantities,
        defaultDrinkQuantities,
        defaultObservation,
      }),
    [
      borderOptions,
      candyOptions,
      defaultBorderOptionId,
      defaultBorderPreference,
      defaultCandyQuantities,
      defaultDrinkQuantities,
      defaultFlavorIds,
      defaultFlavorMode,
      defaultIngredientIds,
      defaultObservation,
      drinkOptions,
      flavorOptions,
      ingredientOptions,
    ],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [borderPreference, setBorderPreference] =
    useState<BorderPreference | null>(initialState.borderPreference);
  const [selectedBorderId, setSelectedBorderId] = useState<string | null>(
    initialState.selectedBorderId,
  );
  const [flavorMode, setFlavorMode] = useState<FlavorMode | null>(
    initialState.flavorMode,
  );
  const [flavorProducts, setFlavorProducts] = useState<CartProduct[]>(
    initialState.flavorProducts,
  );
  const [wantsExtraIngredients, setWantsExtraIngredients] = useState<
    boolean | null
  >(initialState.wantsExtraIngredients);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    initialState.selectedIngredientIds,
  );
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
    setBorderPreference(initialState.borderPreference);
    setSelectedBorderId(initialState.selectedBorderId);
    setFlavorMode(initialState.flavorMode);
    setFlavorProducts(initialState.flavorProducts);
    setWantsExtraIngredients(initialState.wantsExtraIngredients);
    setSelectedIngredientIds(initialState.selectedIngredientIds);
    setWantsCandies(initialState.wantsCandies);
    setCandyProducts(initialState.candyProducts);
    setWantsDrinks(initialState.wantsDrinks);
    setDrinkProducts(initialState.drinkProducts);
    setWantsObservation(initialState.wantsObservation);
    setObservation(initialState.observation);
  }, [initialState, open, resetOnOpen]);

  const borderOptionMap = useMemo(
    () => new Map(borderOptions.map((option) => [option.id, option])),
    [borderOptions],
  );
  const flavorOptionMap = useMemo(
    () => new Map(flavorOptions.map((option) => [option.id, option])),
    [flavorOptions],
  );
  const ingredientOptionMap = useMemo(
    () => new Map(ingredientOptions.map((option) => [option.id, option])),
    [ingredientOptions],
  );
  const candyOptionMap = useMemo(
    () => new Map(candyOptions.map((option) => [option.id, option])),
    [candyOptions],
  );
  const drinkOptionMap = useMemo(
    () => new Map(drinkOptions.map((option) => [option.id, option])),
    [drinkOptions],
  );

  const resolvedStepLabels = [
    stepLabels?.[0] ?? "Borda",
    stepLabels?.[1] ?? "Sabores",
    stepLabels?.[2] ?? "Ingredientes",
    stepLabels?.[3] ?? "Doces",
    stepLabels?.[4] ?? "Bebidas",
    stepLabels?.[5] ?? "Observações",
    stepLabels?.[6] ?? "Finalizar",
  ];

  const steps = useMemo(
    () => [
      {
        id: STEP_IDS[0],
        description:
          "Escolha se deseja borda recheada antes de definir os sabores.",
      },
      {
        id: STEP_IDS[1],
        description:
          "Você pode montar uma pizza inteira ou meio a meio com até dois sabores.",
      },
      {
        id: STEP_IDS[2],
        description:
          "Selecionamos ingredientes que combinam com os sabores escolhidos.",
      },
      {
        id: STEP_IDS[3],
        description: "Sobremesas rápidas ajudam a completar o carrinho.",
      },
      {
        id: STEP_IDS[4],
        description:
          "Escolha bebidas com limite pensado para pedidos residenciais.",
      },
      {
        id: STEP_IDS[5],
        description:
          "Use este campo para ajustes relevantes do preparo ou da entrega.",
      },
      {
        id: STEP_IDS[6],
        description:
          "Confira o resumo completo e conclua o pedido quando estiver tudo certo.",
      },
    ],
    [resolvedStepLabels],
  );

  const currentStepDefinition = steps[currentStep];
  const selectedBorder =
    borderPreference === "com-borda" && selectedBorderId
      ? (borderOptionMap.get(selectedBorderId) ?? null)
      : null;

  const selectedFlavors = useMemo(() => {
    return flavorProducts
      .filter((product) => product.quantity > 0)
      .map((product) => flavorOptionMap.get(product.id))
      .filter(Boolean) as PizzaOrderAssistentFlavorOption[];
  }, [flavorOptionMap, flavorProducts]);

  const visibleIngredientIds = useMemo(() => {
    const ids = selectedFlavors.flatMap(
      (flavor) => flavor.suggestedExtraIngredientIds ?? [],
    );

    return ids.length > 0
      ? Array.from(new Set(ids))
      : ingredientOptions.slice(0, 8).map((option) => option.id);
  }, [ingredientOptions, selectedFlavors]);

  const visibleIngredientOptions = useMemo(() => {
    const visibleIdSet = new Set(visibleIngredientIds);
    const filteredOptions = ingredientOptions.filter((option) =>
      visibleIdSet.has(option.id),
    );

    return filteredOptions.length > 0
      ? filteredOptions
      : ingredientOptions.slice(0, 8);
  }, [ingredientOptions, visibleIngredientIds]);

  useEffect(() => {
    setSelectedIngredientIds((previousIds) =>
      previousIds.filter((id) =>
        visibleIngredientOptions.some((option) => option.id === id),
      ),
    );
  }, [visibleIngredientOptions]);

  const selectedIngredients = useMemo(() => {
    return selectedIngredientIds
      .map((id) => ingredientOptionMap.get(id))
      .filter(Boolean) as PizzaOrderAssistentIngredientOption[];
  }, [ingredientOptionMap, selectedIngredientIds]);

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

  const basePizzaPrice = useMemo(() => {
    if (selectedFlavors.length === 0) return 0;
    if (flavorMode === 2) {
      return Math.max(...selectedFlavors.map((flavor) => flavor.price));
    }

    return selectedFlavors[0]?.price ?? 0;
  }, [flavorMode, selectedFlavors]);

  const borderPrice = selectedBorder?.price ?? 0;
  const ingredientsPrice = selectedIngredients.reduce(
    (sum, ingredient) => sum + ingredient.price,
    0,
  );
  const candiesPrice = selectedCandies.reduce(
    (sum, candy) => sum + candy.price * candy.quantity,
    0,
  );
  const drinksPrice = selectedDrinks.reduce(
    (sum, drink) => sum + drink.price * drink.quantity,
    0,
  );
  const totalPrice =
    basePizzaPrice +
    borderPrice +
    ingredientsPrice +
    candiesPrice +
    drinksPrice;

  const orderPayload: PizzaOrderAssistentOrder = {
    borderPreference: borderPreference ?? "sem-borda",
    borderOption: selectedBorder,
    flavorMode: flavorMode ?? 1,
    flavors: selectedFlavors,
    extraIngredients: selectedIngredients,
    candies: selectedCandies,
    drinks: selectedDrinks,
    observation: wantsObservation ? observation.trim() : "",
    wantsExtraIngredients: wantsExtraIngredients ?? false,
    wantsCandies: wantsCandies ?? false,
    wantsDrinks: wantsDrinks ?? false,
    wantsObservation: wantsObservation ?? false,
    pizzaBasePrice: basePizzaPrice,
    totalPrice,
  };

  const borderPreferenceOptions = toBooleanOptions(
    "Sim, quero borda recheada",
    "Ideal para quem prefere uma experiência mais indulgente.",
    "Não quero borda recheada",
    "Seguimos direto para os sabores da pizza.",
  );

  const flavorModeOptions: Option[] = [
    {
      label: "Um sabor (pizza inteira)",
      value: 1,
      description: "Escolha somente um sabor e mantenha o preço base dele.",
    },
    {
      label: "Dois sabores (meio a meio)",
      value: 2,
      description:
        "No mercado brasileiro, o valor costuma seguir o sabor de maior preço.",
    },
  ];

  const selectedFlavorCount = selectedFlavors.length;

  const isCurrentStepValid = useMemo(() => {
    switch (currentStepDefinition.id) {
      case "borda":
        return (
          borderPreference !== null &&
          (borderPreference === "sem-borda" || Boolean(selectedBorderId))
        );
      case "sabores":
        return (
          flavorMode !== null &&
          selectedFlavorCount > 0 &&
          selectedFlavorCount === flavorMode
        );
      case "ingredientes":
        return wantsExtraIngredients !== null;
      case "doces":
        return wantsCandies !== null;
      case "bebidas":
        return wantsDrinks !== null;
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
    borderPreference,
    currentStepDefinition.id,
    flavorMode,
    isSubmitting,
    observation,
    selectedBorderId,
    selectedFlavorCount,
    wantsCandies,
    wantsDrinks,
    wantsExtraIngredients,
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

  const handleBorderPreferenceChange = (value: BorderPreference) => {
    setBorderPreference(value);
    if (value === "sem-borda") {
      setSelectedBorderId(null);
    }
  };

  const handleFlavorModeChange = (mode: FlavorMode) => {
    setFlavorMode(mode);
    setFlavorProducts((previousProducts) => {
      let remainingSelections = mode;

      return previousProducts.map((product) => {
        if (product.quantity > 0 && remainingSelections > 0) {
          remainingSelections -= 1;
          return {
            ...product,
            quantity: 1,
          };
        }

        return {
          ...product,
          quantity: 0,
        };
      });
    });
  };

  const toggleIngredient = (ingredientId: string, checked: boolean) => {
    setSelectedIngredientIds((previousIds) => {
      if (checked) {
        return Array.from(new Set([...previousIds, ingredientId]));
      }

      return previousIds.filter((id) => id !== ingredientId);
    });
  };

  const updateFlavorProducts = (updatedProducts: CartProduct[]) => {
    setFlavorProducts((previousProducts) =>
      mergeUpdatedProducts(previousProducts, updatedProducts),
    );
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

  const renderBordaStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-borda-preferencia`}
        label="Deseja borda recheada?"
        options={borderPreferenceOptions}
        value={
          borderPreference === "com-borda"
            ? "sim"
            : borderPreference === "sem-borda"
              ? "nao"
              : null
        }
        onSelectOption={(option) =>
          handleBorderPreferenceChange(
            option.value === "sim" ? "com-borda" : "sem-borda",
          )
        }
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
      />

      {borderPreference === "com-borda" ? (
        <RadioGroupInput
          name={`${radioGroupBaseName}-borda-sabor`}
          label="Selecione o sabor da borda"
          options={borderOptions.map((option) => ({
            label: option.badge
              ? `${option.label} (${option.badge})`
              : option.label,
            value: option.id,
            description: `${option.description ?? ""} + ${formatBRL(option.price)}`,
          }))}
          value={selectedBorderId}
          onSelectOption={(option) => setSelectedBorderId(String(option.value))}
          containerClassName={radioGroupContainerClassName}
          optionsContainerClassName={scrollableOptionsClassName}
          helperText="A borda é somada ao valor final do pedido."
        />
      ) : null}
    </div>
  );

  const renderSaboresStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-sabores-tipo`}
        label="Como deseja montar a pizza?"
        options={flavorModeOptions}
        value={flavorMode}
        onSelectOption={(option) =>
          handleFlavorModeChange(Number(option.value) as FlavorMode)
        }
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
        helperText={
          flavorMode === 2
            ? "Selecione exatamente 2 sabores diferentes."
            : "Selecione exatamente 1 sabor."
        }
      />

      <CartCard
        products={flavorProducts}
        onProductsChange={updateFlavorProducts}
        title={`Sabores disponíveis (${selectedFlavorCount}/${flavorMode ?? 1})`}
        description="Cada sabor pode ser escolhido apenas uma vez."
        emptyCartCardMessage="Nenhum sabor encontrado para a busca atual."
        className={cartCardClassName}
        listClassName={clsx(scrollableOptionsClassName, cartCardListClassName)}
        itemClassName={cartCardItemClassName}
        itemNameClassName={cartCardItemNameClassName}
        itemDescriptionClassName={cartCardItemDescriptionClassName}
        itemBadgeClassName={cartCardItemBadgeClassName}
        itemPriceClassName={cartCardItemPriceClassName}
        keepZeroQuantityItems
        showRemoveButton={false}
        priceMode="unit"
        isIncreaseDisabled={(product, products) => {
          if (!flavorMode) return true;
          if (product.quantity >= 1) return true;

          const totalSelected = products.filter(
            (item) => item.quantity > 0,
          ).length;
          return totalSelected >= flavorMode;
        }}
        isDecreaseDisabled={(product) => product.quantity <= 0}
        priceFormatter={(product) => `+ ${formatBRL(product.price)}`}
      />

    </div>
  );

  const renderIngredientesStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-extras-preferencia`}
        label="Deseja acrescentar algum ingrediente?"
        options={toBooleanOptions(
          "Sim, quero incluir extras",
          "Mostramos apenas opções coerentes com os sabores escolhidos.",
          "Não, a pizza já está do jeito certo",
          "Seguimos para as sobremesas.",
        )}
        value={
          wantsExtraIngredients === null
            ? null
            : wantsExtraIngredients
              ? "sim"
              : "nao"
        }
        onSelectOption={(option) => {
          const nextValue = option.value === "sim";
          setWantsExtraIngredients(nextValue);
          if (!nextValue) {
            setSelectedIngredientIds([]);
          }
        }}
        containerClassName={radioGroupContainerClassName}
        optionsContainerClassName={scrollableOptionsClassName}
      />

      {wantsExtraIngredients ? (
        <div
          className={clsx(
            "grid max-h-[20vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2",
            checkboxGridClassName,
          )}
        >
          {visibleIngredientOptions.map((ingredient) => {
            const checked = selectedIngredientIds.includes(ingredient.id);

            return (
              <label
                key={ingredient.id}
                className={clsx(
                  "rounded-2xl border border-border-card bg-bg-card p-4 transition hover:border-primary-500/50",
                  checked && "border-primary-500 bg-primary-500/5",
                  checkboxItemClassName,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Checkbox
                    checked={checked}
                    onChange={(event) =>
                      toggleIngredient(ingredient.id, event.target.checked)
                    }
                    helperText={ingredient.name}
                    description={ingredient.description}
                    labelClassName={checkboxLabelClassName}
                    descriptionClassName={checkboxDescriptionClassName}
                  />
                  <span className="text-sm font-semibold text-primary-600">
                    + {formatBRL(ingredient.price)}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const renderDocesStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-doces-preferencia`}
        label="Deseja incluir algum doce?"
        options={toBooleanOptions(
          "Sim, quero uma sobremesa",
          "Você pode selecionar até 10 unidades por item.",
          "Não, vou ficar só com a pizza",
          "Seguimos direto para as bebidas.",
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
        <>
          <CartCard
            products={candyProducts}
            onProductsChange={updateCandyProducts}
            title="Doces disponíveis"
            description="Cada item pode ter até 10 unidades."
            emptyCartCardMessage="Nenhum doce corresponde à pesquisa."
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
        </>
      ) : null}
    </div>
  );

  const renderBebidasStep = () => (
    <div className={clsx("space-y-6", sectionClassName)}>
      <RadioGroupInput
        name={`${radioGroupBaseName}-bebidas-preferencia`}
        label="Deseja adicionar bebidas?"
        options={toBooleanOptions(
          "Sim, quero bebidas",
          "Você pode selecionar até 2 unidades por bebida.",
          "Não, vou finalizar sem bebidas",
          "Seguimos para as observações finais.",
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
        <>
          <CartCard
            products={drinkProducts}
            onProductsChange={updateDrinkProducts}
            title="Bebidas disponíveis"
            description="Cada bebida pode ter até 2 unidades por pedido."
            emptyCartCardMessage="Nenhuma bebida corresponde à pesquisa."
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
        </>
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
          "Exemplos: retirar cebola, enviar sem cortar ou avisar ponto de referência.",
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
          placeholder="Ex.: retirar cebola da metade portuguesa, mandar guardanapos ou informar bloco/apto."
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
        {renderHelperCard(
          "Pizza principal",
          selectedFlavors.length > 0
            ? `${selectedFlavors.map((flavor) => flavor.name).join(" + ")}`
            : "Nenhum sabor selecionado.",
        )}

        {selectedBorder
          ? renderHelperCard(
              "Borda escolhida",
              `${selectedBorder.label} por + ${formatBRL(selectedBorder.price)}`,
            )
          : null}

        {selectedIngredients.length > 0
          ? renderHelperCard(
              "Ingredientes extras",
              selectedIngredients
                .map(
                  (ingredient) =>
                    `${ingredient.name} (+ ${formatBRL(ingredient.price)})`,
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

        {wantsObservation && observation.trim()
          ? renderHelperCard("Observação", observation.trim())
          : null}
      </div>
    </div>
  );

  const summarySections = [
    {
      label: "Pizza",
      value:
        selectedFlavors.length > 0
          ? selectedFlavors.map((flavor) => flavor.name).join(" + ")
          : "Aguardando seleção",
      price: basePizzaPrice,
    },
    {
      label: "Borda",
      value: selectedBorder?.label ?? "Sem borda recheada",
      price: borderPrice,
    },
    {
      label: "Extras",
      value:
        selectedIngredients.length > 0
          ? `${selectedIngredients.length} ingrediente(s)`
          : "Sem adicionais",
      price: ingredientsPrice,
    },
    {
      label: "Doces",
      value:
        selectedCandies.length > 0
          ? `${selectedCandies.reduce((sum, candy) => sum + candy.quantity, 0)} item(ns)`
          : "Sem doces",
      price: candiesPrice,
    },
    {
      label: "Bebidas",
      value:
        selectedDrinks.length > 0
          ? `${selectedDrinks.reduce((sum, drink) => sum + drink.quantity, 0)} item(ns)`
          : "Sem bebidas",
      price: drinksPrice,
    },
  ];

  const renderCurrentStep = () => {
    switch (currentStepDefinition.id) {
      case "borda":
        return renderBordaStep();
      case "sabores":
        return renderSaboresStep();
      case "ingredientes":
        return renderIngredientesStep();
      case "doces":
        return renderDocesStep();
      case "bebidas":
        return renderBebidasStep();
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
          "bg-[radial-gradient(circle_at_top,rgba(199,73,30,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,1))]",
          "dark:bg-[radial-gradient(circle_at_top,rgba(199,73,30,0.18),transparent_40%),linear-gradient(180deg,rgba(14,14,14,0.98),rgba(10,10,10,1))]",
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
              <PizzaIcon size={24} weight="fill" />
            </span>
            <div className="min-w-0">
              <h2
                className={clsx(
                  "mt-2 text-xl font-semibold tracking-tight sm:text-2xl",
                  titleClassName,
                )}
              >
                {title}
              </h2>
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
                "h-fit rounded-3xl border border-border-card bg-bg-card/80 p-5 shadow-sm lg:sticky lg:top-4",
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

              <div className="mt-5 rounded-3xl border border-primary-500/15 bg-primary-500/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">
                  Total estimado
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {formatBRL(totalPrice)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                  {selectedFlavors.length === 0
                    ? "Escolha ao menos um sabor para liberar a finalização."
                    : "O total considera borda, extras, doces e bebidas selecionados."}
                </p>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export {
  defaultPizzaOrderAssistentBorders,
  defaultPizzaOrderAssistentCandies,
  defaultPizzaOrderAssistentDrinks,
  defaultPizzaOrderAssistentFlavors,
  defaultPizzaOrderAssistentIngredients,
};
export type {
  PizzaOrderAssistentAdditionalOption,
  PizzaOrderAssistentBorderOption,
  PizzaOrderAssistentFlavorOption,
  PizzaOrderAssistentIngredientOption,
};
