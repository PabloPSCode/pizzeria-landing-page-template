export interface PizzaOrderAssistentBorderOption {
  id: string;
  label: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface PizzaOrderAssistentIngredientOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface PizzaOrderAssistentFlavorOption {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  ingredients: string[];
  badge?: string;
  suggestedExtraIngredientIds?: string[];
}

export interface PizzaOrderAssistentAdditionalOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  badge?: string;
}

export const defaultPizzaOrderAssistentBorders: PizzaOrderAssistentBorderOption[] =
  [
    {
      id: "borda-catupiry-cheddar",
      label: "Metade Catupiry e metade Cheddar",
      price: 10.9,
      description: "Combina as duas bordas mais pedidas da casa.",
      badge: "Mais pedida",
    },
    {
      id: "borda-catupiry-cremoso",
      label: "Catupiry cremoso",
      price: 10.9,
      description: "Recheio clássico, suave e bem cremoso.",
    },
    {
      id: "borda-cheddar-cremoso",
      label: "Cheddar cremoso",
      price: 10.9,
      description: "Perfil intenso e bem derretido até a última fatia.",
    },
    {
      id: "borda-cream-cheese",
      label: "Cream cheese",
      price: 11.9,
      description: "Textura amanteigada com sabor delicado.",
    },
    {
      id: "borda-frango-catupiry",
      label: "Frango com catupiry",
      price: 11.9,
      description: "Recheio generoso com frango temperado da casa.",
    },
    {
      id: "borda-milho-catupiry",
      label: "Milho com catupiry",
      price: 12.9,
      description: "Mistura adocicada e cremosa, ótima para sabores leves.",
    },
  ];

export const defaultPizzaOrderAssistentIngredients: PizzaOrderAssistentIngredientOption[] =
  [
    {
      id: "mucarela-extra",
      name: "Muçarela extra",
      price: 7.5,
      description: "Camada extra para deixar a pizza ainda mais cremosa.",
    },
    {
      id: "catupiry-original",
      name: "Catupiry original",
      price: 8.9,
      description: "Porção adicional do recheio mais querido do Brasil.",
    },
    {
      id: "calabresa-artesanal",
      name: "Calabresa artesanal",
      price: 9.5,
      description: "Fatiada fina, com sabor defumado e marcante.",
    },
    {
      id: "frango-desfiado",
      name: "Frango desfiado",
      price: 8.9,
      description: "Temperado na manteiga e finalizado com ervas.",
    },
    {
      id: "bacon-crocante",
      name: "Bacon crocante",
      price: 10.9,
      description: "Crocrância e sabor defumado em cubos.",
    },
    {
      id: "milho-verde",
      name: "Milho verde",
      price: 5.5,
      description: "Doce na medida, ótimo para pizzas cremosas.",
    },
    {
      id: "cebola-roxa",
      name: "Cebola roxa",
      price: 3.5,
      description: "Fatiada fina para equilibrar sabores intensos.",
    },
    {
      id: "azeitona-preta",
      name: "Azeitona preta",
      price: 4.5,
      description: "Toque salgado que combina bem com pizzas clássicas.",
    },
    {
      id: "brocolis-salteado",
      name: "Brócolis salteado",
      price: 5.9,
      description: "Salteado no alho para manter sabor e textura.",
    },
    {
      id: "alho-dourado",
      name: "Alho dourado",
      price: 3.9,
      description: "Notas aromáticas e tostadas para finalizar.",
    },
    {
      id: "parmesao-final",
      name: "Parmesão final",
      price: 6.5,
      description: "Raspas de parmesão para gratinar mais forte.",
    },
    {
      id: "pepperoni-picante",
      name: "Pepperoni picante",
      price: 10.5,
      description: "Ideal para quem prefere sabor marcante.",
    },
    {
      id: "tomate-cereja",
      name: "Tomate-cereja",
      price: 5.2,
      description: "Suculento e fresco para receitas mediterrâneas.",
    },
    {
      id: "manjericao-fresco",
      name: "Manjericão fresco",
      price: 3.2,
      description: "Finalização perfumada e tradicional.",
    },
  ];

export const defaultPizzaOrderAssistentFlavors: PizzaOrderAssistentFlavorOption[] =
  [
    {
      id: "sabor-calabresa-da-serra",
      name: "Calabresa da Serra",
      price: 59.9,
      imageUrl: "/pizza1.jpg",
      description:
        "Molho artesanal, muçarela especial, calabresa defumada, cebola roxa e orégano fresco.",
      ingredients: [
        "Molho artesanal",
        "Muçarela especial",
        "Calabresa defumada",
        "Cebola roxa",
        "Orégano fresco",
      ],
      badge: "Clássica",
      suggestedExtraIngredientIds: [
        "mucarela-extra",
        "calabresa-artesanal",
        "cebola-roxa",
        "azeitona-preta",
      ],
    },
    {
      id: "sabor-frango-cremoso",
      name: "Frango Cremoso",
      price: 63.9,
      imageUrl: "/pizza2.jpg",
      description:
        "Molho da casa, frango desfiado, catupiry, milho verde, muçarela e toque de cebolinha.",
      ingredients: [
        "Molho da casa",
        "Frango desfiado",
        "Catupiry",
        "Milho verde",
        "Muçarela",
        "Cebolinha",
      ],
      badge: "Favorita da casa",
      suggestedExtraIngredientIds: [
        "frango-desfiado",
        "catupiry-original",
        "milho-verde",
        "bacon-crocante",
      ],
    },
    {
      id: "sabor-broccolino-premium",
      name: "Broccolino Premium",
      price: 67.9,
      imageUrl: "/Broccolino.jpg",
      description:
        "Brócolis salteado, bacon crocante, alho dourado, muçarela e parmesão finalizado no forno.",
      ingredients: [
        "Brócolis salteado",
        "Bacon crocante",
        "Alho dourado",
        "Muçarela",
        "Parmesão final",
      ],
      badge: "Gourmet",
      suggestedExtraIngredientIds: [
        "brocolis-salteado",
        "bacon-crocante",
        "alho-dourado",
        "parmesao-final",
      ],
    },
    {
      id: "sabor-portuguesa-paulistana",
      name: "Portuguesa Paulistana",
      price: 64.9,
      imageUrl: "/pizza5.jpg",
      description:
        "Presunto, muçarela, cebola, ovos, azeitonas e toque de parmesão gratinado.",
      ingredients: [
        "Presunto",
        "Muçarela",
        "Cebola",
        "Ovos",
        "Azeitonas",
        "Parmesão",
      ],
      badge: "Tradicional",
      suggestedExtraIngredientIds: [
        "mucarela-extra",
        "cebola-roxa",
        "azeitona-preta",
        "parmesao-final",
      ],
    },
    {
      id: "sabor-pepperoni-do-chef",
      name: "Pepperoni do Chef",
      price: 69.9,
      imageUrl: "/pizza9.webp",
      description:
        "Pepperoni picante, muçarela, toque de cream cheese, cebola roxa e molho levemente apimentado.",
      ingredients: [
        "Pepperoni picante",
        "Muçarela",
        "Cream cheese",
        "Cebola roxa",
        "Molho apimentado",
      ],
      badge: "Picante",
      suggestedExtraIngredientIds: [
        "pepperoni-picante",
        "mucarela-extra",
        "cebola-roxa",
        "catupiry-original",
      ],
    },
    {
      id: "sabor-margherita-brasa",
      name: "Margherita da Brasa",
      price: 61.9,
      imageUrl: "/pizza6.jpg",
      description:
        "Molho de tomate rústico, muçarela, tomate-cereja confitado e manjericão fresco.",
      ingredients: [
        "Molho de tomate rústico",
        "Muçarela",
        "Tomate-cereja",
        "Manjericão fresco",
      ],
      badge: "Leve",
      suggestedExtraIngredientIds: [
        "mucarela-extra",
        "tomate-cereja",
        "manjericao-fresco",
        "parmesao-final",
      ],
    },
  ];

export const defaultPizzaOrderAssistentCandies: PizzaOrderAssistentAdditionalOption[] =
  [
    {
      id: "doce-brownie-belga",
      name: "Brownie belga",
      price: 9.9,
      description: "Casquinha leve por fora e centro bem molhadinho.",
      badge: "Campeão de pedidos",
      imageUrl: "/pizza8.jpg",
    },
    {
      id: "doce-brigadeiro-copinho",
      name: "Brigadeiro de copinho",
      price: 8.9,
      description: "Chocolate intenso com granulado crocante.",
      imageUrl: "/pizza7.jpg",
    },
    {
      id: "doce-churros-bites",
      name: "Churros bites",
      price: 12.9,
      description: "Mini churros com açúcar, canela e doce de leite.",
      imageUrl: "/pizza6.jpg",
    },
    {
      id: "doce-pizza-brotinho",
      name: "Pizza brotinho de brigadeiro",
      price: 18.9,
      description: "Ideal para dividir a sobremesa sem pesar no pedido.",
      imageUrl: "/pizza8.jpg",
    },
  ];

export const defaultPizzaOrderAssistentDrinks: PizzaOrderAssistentAdditionalOption[] =
  [
    {
      id: "bebida-coca-2l",
      name: "Coca-Cola 2L",
      price: 14.9,
      description: "A opção mais pedida para acompanhar pizza família.",
      badge: "Mais pedida",
      imageUrl:
        "https://andinacocacola.vtexassets.com/arquivos/ids/158758-800-auto?aspect=true&height=auto&v=638781810539300000&width=800",
    },
    {
      id: "bebida-guarana-2l",
      name: "Guaraná Antarctica 2L",
      price: 12.9,
      description: "Combina muito bem com sabores clássicos.",
      imageUrl:
        "https://seabrafoods.com/cdn/shop/products/antarctica-guarana-2l-seabra-foods-online_1200x1200.jpg?v=1706323584",
    },
    {
      id: "bebida-fanta-laranja-2l",
      name: "Fanta Laranja 2L",
      price: 12.9,
      description: "Perfil cítrico e leve para dividir em casa.",
      imageUrl:
        "https://andinacocacola.vtexassets.com/arquivos/ids/159003-800-auto?aspect=true&height=auto&v=639094449078300000&width=800",
    },
    {
      id: "bebida-kaiser-lata",
      name: "Kaiser Pilsen 350ml",
      price: 6.9,
      description: "Lata gelada para quem quer completar o pedido da noite.",
      imageUrl: "https://cms.kaiser.com.br/media/asdhd2rz/kaiser_lata_350ml.webp",
    },
  ];
