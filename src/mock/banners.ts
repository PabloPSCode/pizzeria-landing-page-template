export interface BannerMock {
  id: string;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  targetId: string;
}

export const promoBanners: BannerMock[] = [
  {
    id: "banner-terca",
    image: "/banner1.png",
    badge: "Oferta da semana",
    title: "Terça da pizza grande com preço de broto",
    subtitle:
      "Escolha entre os sabores mais pedidos da casa e garanta o jantar da galera sem pesar no bolso.",
    ctaLabel: "Quero aproveitar",
    targetId: "promocoes",
  },
  {
    id: "banner-borda",
    image: "/banner2.png",
    badge: "Favorita da casa",
    title: "Borda recheada e refri gelado no combo da noite",
    subtitle:
      "Combinações pensadas para quem não abre mão de massa leve, muito recheio e entrega rápida.",
    ctaLabel: "Ver combos",
    targetId: "cardapio",
  },
  {
    id: "banner-misto",
    image: "/banner3.png",
    badge: "Depois das 18h",
    title: "Burger artesanal, croissant e pizza doce no mesmo pedido",
    subtitle:
      "Monte o pedido do seu jeito e misture sabores salgados e doces para dividir ou comer sozinho.",
    ctaLabel: "Explorar cardápio",
    targetId: "categorias",
  },
];
