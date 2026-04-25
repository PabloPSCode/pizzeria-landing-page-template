export type MenuCategorySlug =
  | "pizzas-salgadas"
  | "pizzas-doces"
  | "borda-recheada"
  | "burguers-artesanais"
  | "croissants-recheados"
  | "combos-da-casa";

export interface MenuCategoryMock {
  id: string;
  name: string;
  slug: MenuCategorySlug;
  description: string;
  image: string;
}

export const menuCategories: MenuCategoryMock[] = [
  {
    id: "cat-pizzas-salgadas",
    name: "Pizzas salgadas",
    slug: "pizzas-salgadas",
    description: "Sabores clássicos com massa leve e molho artesanal.",
    image: "/pizza1.jpg",
  },
  {
    id: "cat-pizzas-doces",
    name: "Pizzas doces",
    slug: "pizzas-doces",
    description: "Coberturas cremosas para fechar a noite em alta.",
    image: "/pizza8.jpg",
  },
  {
    id: "cat-borda-recheada",
    name: "Com borda recheada",
    slug: "borda-recheada",
    description: "Opções generosas com cheddar, catupiry e muito recheio.",
    image: "/pizza9.webp",
  },
  {
    id: "cat-burguers-artesanais",
    name: "Burguers artesanais",
    slug: "burguers-artesanais",
    description: "Smash burgers com pão macio e muito sabor.",
    image: "/burguer1.webp",
  },
  {
    id: "cat-croissants-recheados",
    name: "Croissants recheados",
    slug: "croissants-recheados",
    description: "Crocância por fora e recheio cremoso por dentro.",
    image: "/croissant.jpg",
  },
  {
    id: "cat-combos-da-casa",
    name: "Combos da casa",
    slug: "combos-da-casa",
    description: "Perfeitos para dividir com a família ou a galera.",
    image: "/pizza6.jpg",
  },
];
