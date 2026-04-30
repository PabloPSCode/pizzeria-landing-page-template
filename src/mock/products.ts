import type { MenuCategorySlug } from "./categories";

export interface MenuProductMock {
  id: string;
  slug: string;
  categorySlug: MenuCategorySlug;
  name: string;
  price: number;
  ingredientes: string;
  image: string;
  destaque?: boolean;
  featuredPosition?: number;
  rating?: 0 | 1 | 2 | 3 | 4 | 5;
}

export const menuProducts: MenuProductMock[] = [
  {
    id: "prod-calabresa-da-serra",
    slug: "calabresa-da-serra",
    categorySlug: "pizzas-salgadas",
    name: "Calabresa da Serra",
    price: 59.9,
    ingredientes:
      "Molho artesanal, muçarela especial, calabresa defumada, cebola roxa e orégano fresco.",
    image: "/pizza1.jpg",
    destaque: true,
    featuredPosition: 1,
    rating: 5,
  },
  {
    id: "prod-frango-cremoso",
    slug: "frango-cremoso",
    categorySlug: "pizzas-salgadas",
    name: "Frango Cremoso",
    price: 63.9,
    ingredientes:
      "Molho da casa, frango desfiado, catupiry, milho verde, muçarela e toque de cebolinha.",
    image: "/pizza2.jpg",
    rating: 5,
  },
  {
    id: "prod-broccolino-premium",
    slug: "broccolino-premium",
    categorySlug: "pizzas-salgadas",
    name: "Broccolino Premium",
    price: 67.9,
    ingredientes:
      "Brócolis salteado, bacon crocante, alho dourado, muçarela e parmesão finalizado no forno.",
    image: "/Broccolino.jpg",
    destaque: true,
    featuredPosition: 4,
    rating: 4,
  },
  {
    id: "prod-brigadeiro-crocante",
    slug: "brigadeiro-crocante",
    categorySlug: "pizzas-doces",
    name: "Brigadeiro Crocante",
    price: 54.9,
    ingredientes:
      "Chocolate ao leite, brigadeiro cremoso, granulado belga e raspas de chocolate meio amargo.",
    image: "/pizza8.jpg",
    destaque: true,
    featuredPosition: 3,
    rating: 5,
  },
  {
    id: "prod-romeu-julieta-mineira",
    slug: "romeu-julieta-mineira",
    categorySlug: "pizzas-doces",
    name: "Romeu e Julieta Mineira",
    price: 52.9,
    ingredientes:
      "Goiabada cascão, creme de queijo, leite condensado e farofa doce de canela.",
    image: "/pizza7.jpg",
    rating: 4,
  },
  {
    id: "prod-borda-cheddar-bacon",
    slug: "borda-cheddar-bacon",
    categorySlug: "borda-recheada",
    name: "Borda Cheddar & Bacon",
    price: 72.9,
    ingredientes:
      "Pepperoni, muçarela extra, molho levemente picante e borda recheada com cheddar e bacon.",
    image: "/pizza9.webp",
    destaque: true,
    featuredPosition: 2,
    rating: 5,
  },
  {
    id: "prod-borda-catupiry-especial",
    slug: "borda-catupiry-especial",
    categorySlug: "borda-recheada",
    name: "Borda Catupiry Especial",
    price: 74.9,
    ingredientes:
      "Lombo canadense, cebola caramelizada, muçarela e borda generosa recheada com catupiry.",
    image: "/pizza5.jpg",
    rating: 4,
  },
  {
    id: "prod-smash-monlevade",
    slug: "smash-monlevade",
    categorySlug: "burguers-artesanais",
    name: "Smash Monlevade",
    price: 32.9,
    ingredientes:
      "Pão brioche, burger 160g, queijo prato, cebola caramelizada, picles e maionese da casa.",
    image: "/burguer1.webp",
    destaque: true,
    featuredPosition: 5,
    rating: 5,
  },
  {
    id: "prod-bacon-da-praca",
    slug: "bacon-da-praca",
    categorySlug: "burguers-artesanais",
    name: "Bacon da Praça",
    price: 36.9,
    ingredientes:
      "Burger 180g, cheddar cremoso, bacon crocante, alface americana e molho barbecue artesanal.",
    image: "/burguer2.jpg",
    rating: 4,
  },
  {
    id: "prod-x-egg-bacon",
    slug: "x-egg-bacon",
    categorySlug: "burguers-artesanais",
    name: "X-Egg Bacon",
    price: 38.9,
    ingredientes:
      "Pão brioche, burger 180g, queijo prato, ovo caipira, bacon crocante e maionese da casa.",
    image: "/burguer1.webp",
    rating: 5,
  },
  {
    id: "prod-x-bacon-bbq",
    slug: "x-bacon-bbq",
    categorySlug: "burguers-artesanais",
    name: "X-Bacon BBQ",
    price: 39.9,
    ingredientes:
      "Burger 180g, cheddar cremoso, bacon em dobro, cebola caramelizada e molho barbecue artesanal.",
    image: "/burguer2.jpg",
    rating: 5,
  },
  {
    id: "prod-x-salada-artesanal",
    slug: "x-salada-artesanal",
    categorySlug: "burguers-artesanais",
    name: "X-Salada Artesanal",
    price: 34.9,
    ingredientes:
      "Pão brioche, burger 160g, queijo prato, alface americana, tomate fresco, picles e maionese especial.",
    image: "/burguer1.webp",
    rating: 4,
  },
  {
    id: "prod-croissant-frango-cremoso",
    slug: "croissant-frango-cremoso",
    categorySlug: "croissants-recheados",
    name: "Croissant Frango Cremoso",
    price: 24.9,
    ingredientes:
      "Croissant amanteigado com frango desfiado, creme de milho, requeijão e queijo gratinado.",
    image: "/croissant.jpg",
    rating: 4,
  },
  {
    id: "prod-croissant-queijos-da-casa",
    slug: "croissant-queijos-da-casa",
    categorySlug: "croissants-recheados",
    name: "Croissant Queijos da Casa",
    price: 26.9,
    ingredientes:
      "Massa folhada com muçarela, provolone, parmesão e toque de ervas finas.",
    image: "/croissant.jpg",
    rating: 5,
  },
  {
    id: "prod-combo-familia-monlevade",
    slug: "combo-familia-monlevade",
    categorySlug: "combos-da-casa",
    name: "Combo Família Monlevade",
    price: 119.9,
    ingredientes:
      "1 pizza grande salgada, 1 pizza doce broto, 1 porção de croissants salgados e refrigerante 2L.",
    image: "/pizza6.jpg",
    destaque: true,
    featuredPosition: 6,
    rating: 5,
  },
];
