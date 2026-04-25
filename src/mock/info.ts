export interface InfoMock {
  id: string;
  icon: "timer" | "delivery" | "menu";
  title: string;
}

export const landingInfos: InfoMock[] = [
  {
    id: "info-funcionamento",
    icon: "timer",
    title: "Entrega até 23h30",
  },
  {
    id: "info-entrega",
    icon: "delivery",
    title: "Retira o pedido ou recebe em casa",
  },
  {
    id: "info-mix",
    icon: "menu",
    title: "Cardápio variado com diversas opções",
  },
];
