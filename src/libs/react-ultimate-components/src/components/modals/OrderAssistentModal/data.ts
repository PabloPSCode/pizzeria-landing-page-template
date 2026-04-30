import {
  defaultPizzaOrderAssistentDrinks,
  type PizzaOrderAssistentAdditionalOption,
} from "../PizzaOrderAssistentModal/data";

export type OrderAssistentAdditionalOption =
  PizzaOrderAssistentAdditionalOption;

export const defaultOrderAssistentCandies: OrderAssistentAdditionalOption[] = [
  {
    id: "doce-brownie-nutella",
    name: "Brownie com Nutella",
    price: 11.9,
    description: "Casquinha leve por fora e recheio bem chocolatudo.",
    badge: "Mais pedido",
    imageUrl: "/pizza8.jpg",
  },
  {
    id: "doce-cookie-recheado",
    name: "Cookie recheado",
    price: 9.9,
    description: "Massa macia com centro cremoso de chocolate.",
    imageUrl: "/pizza7.jpg",
  },
  {
    id: "doce-pudim-gelado",
    name: "Pudim gelado",
    price: 8.9,
    description: "Sobremesa clássica para fechar o pedido.",
    imageUrl: "/pizza6.jpg",
  },
  {
    id: "doce-churros-copinho",
    name: "Churros no copinho",
    price: 12.9,
    description: "Mini churros com doce de leite e canela.",
    imageUrl: "/pizza8.jpg",
  },
];

export const defaultOrderAssistentDrinks: OrderAssistentAdditionalOption[] =
  defaultPizzaOrderAssistentDrinks;
