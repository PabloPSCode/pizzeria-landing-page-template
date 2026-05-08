import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStoreByDomain } from "../../../../lib/store-data";
import { StoreAddress } from "../../../../types";

export const dynamic = "force-dynamic";

interface OrderCartItemPayload {
  id: string;
  name: string;
  price: number;
  quantity: number;
  details?: string[];
}

interface AddressPayload {
  id: string;
  label: string;
  address: string;
  residenceNumber: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  country?: string;
}

interface CreatePaymentLinkRequest {
  items: OrderCartItemPayload[];
  selectedAddress: AddressPayload | null;
  fulfillmentMethod?: "delivery" | "pickup";
  deliveryFee: number;
  total: number;
  customerWhatsapp: string;
}

interface AsaasPaymentLinkResponse {
  id?: string;
  url?: string;
  shortUrl?: string;
  invoiceUrl?: string;
  errors?: Array<{
    description?: string;
  }>;
}

const ASAAS_API_BASE_URL =
  process.env.ASAAS_API_BASE_URL ?? "https://api-sandbox.asaas.com/v3";

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const isValidCustomerWhatsapp = (value: string) =>
  /^55\d{10,11}$/.test(normalizeDigits(value));

const buildOrderReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MLP-${timestamp}-${randomSuffix}`;
};

const buildAddressDescription = (address: AddressPayload) =>
  `${address.label}: ${address.address}, ${address.residenceNumber}${
    address.complement ? ` - ${address.complement}` : ""
  }, ${address.neighborhood}${address.zipCode ? ` - CEP ${address.zipCode}` : ""}`;

const buildItemsSummary = (items: OrderCartItemPayload[]) =>
  items
    .slice(0, 4)
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

const buildPickupDescription = (storeAddress: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}) => {
  const location = [
    storeAddress.street,
    [storeAddress.city, storeAddress.state].filter(Boolean).join(" - "),
    storeAddress.zipCode ? `CEP ${storeAddress.zipCode}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return location ? `Retirada na loja: ${location}` : "Retirada na loja";
};

const buildDescription = (
  items: OrderCartItemPayload[],
  address: AddressPayload | null,
  customerWhatsapp: string,
  fulfillmentMethod: "delivery" | "pickup",
  storeAddress: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  },
) => {
  const description = [
    `WhatsApp do cliente: ${customerWhatsapp}`,
    fulfillmentMethod === "pickup"
      ? buildPickupDescription(storeAddress)
      : `Entrega: ${buildAddressDescription(address as AddressPayload)}`,
    `Itens: ${buildItemsSummary(items)}`,
  ].join(" | ");

  return description.slice(0, 255);
};

const readAsaasErrorMessage = (responseBody: AsaasPaymentLinkResponse | null) => {
  if (!responseBody) {
    return "Não foi possível gerar o link de pagamento.";
  }

  return (
    responseBody.errors?.[0]?.description ??
    "Não foi possível gerar o link de pagamento."
  );
};

const safeParseJson = (value: string): AsaasPaymentLinkResponse | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AsaasPaymentLinkResponse;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "A chave da API do ASAAS não está configurada no ambiente do servidor.",
      },
      { status: 500 }
    );
  }

  let requestBody: CreatePaymentLinkRequest;

  try {
    requestBody = (await request.json()) as CreatePaymentLinkRequest;
  } catch {
    return NextResponse.json(
      { message: "Os dados enviados para finalizar o pedido são inválidos." },
      { status: 400 }
    );
  }

  const {
    items,
    selectedAddress,
    fulfillmentMethod: rawFulfillmentMethod,
    deliveryFee,
    total,
    customerWhatsapp,
  } = requestBody;
  const fulfillmentMethod =
    rawFulfillmentMethod === "pickup" ? "pickup" : "delivery";

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    (fulfillmentMethod === "delivery" && !selectedAddress)
  ) {
    return NextResponse.json(
      {
        message:
          fulfillmentMethod === "pickup"
            ? "O pedido precisa conter ao menos um item."
            : "O pedido precisa conter itens e endereço de entrega.",
      },
      { status: 400 }
    );
  }

  if (!isValidCustomerWhatsapp(customerWhatsapp)) {
    return NextResponse.json(
      { message: "Informe um WhatsApp válido para receber o link." },
      { status: 400 }
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const safeDeliveryFee =
    fulfillmentMethod === "pickup" ? 0 : Number(deliveryFee) || 0;
  const computedTotal = roundCurrency(subtotal + safeDeliveryFee);

  if (computedTotal <= 0) {
    return NextResponse.json(
      { message: "O valor total do pedido precisa ser maior do que zero." },
      { status: 400 }
    );
  }

  if (Math.abs(computedTotal - (Number(total) || 0)) > 0.01) {
    return NextResponse.json(
      {
        message:
          "O total do pedido ficou inconsistente. Recarregue a página e tente novamente.",
      },
      { status: 400 }
    );
  }

  const headerList = headers();
  const host =
    (await headerList).get("x-store-slug") ??
    (await headerList).get("x-forwarded-host") ??
    (await headerList).get("host");
  const { storeData } = await getStoreByDomain(host);

  const orderReference = buildOrderReference();
  const paymentLinkPayload = {
    name: `Pedido ${storeData.store.name} - ${orderReference}`,
    description: buildDescription(
      items,
      selectedAddress,
      normalizeDigits(customerWhatsapp),
      fulfillmentMethod,
      storeData.address as StoreAddress,
    ),
    billingType: "UNDEFINED",
    chargeType: "DETACHED",
    value: computedTotal,
    dueDateLimitDays: 1,
    notificationEnabled: false,
    isAddressRequired: false,
    externalReference: orderReference,
    endDate: formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  };

  const asaasResponse = await fetch(`${ASAAS_API_BASE_URL}/paymentLinks`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      access_token: apiKey,
      "user-agent": "MonlevadePizzas/1.0 (Next.js)",
    },
    body: JSON.stringify(paymentLinkPayload),
    cache: "no-store",
  });

  const responseText = await asaasResponse.text();
  const responseBody = safeParseJson(responseText);

  if (!asaasResponse.ok) {
    return NextResponse.json(
      {
        message: readAsaasErrorMessage(responseBody),
      },
      { status: asaasResponse.status }
    );
  }

  const paymentLinkUrl =
    responseBody?.url ?? responseBody?.shortUrl ?? responseBody?.invoiceUrl;

  if (typeof paymentLinkUrl !== "string" || paymentLinkUrl.length === 0) {
    return NextResponse.json(
      {
        message:
          "O link de pagamento foi criado, mas a URL nao retornou no formato esperado.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    paymentLinkId: responseBody?.id ?? null,
    paymentLinkUrl,
    orderReference,
    total: computedTotal,
  });
}
