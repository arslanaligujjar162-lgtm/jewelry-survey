import type { PaymentProvider } from "./types";
import { codProvider } from "./cod";
import { gatewayProvider } from "./gateway";

export type { PaymentProvider, PaymentChargeRequest, PaymentChargeResult } from "./types";

const providers: PaymentProvider[] = [codProvider, gatewayProvider];

export function getPaymentProvider(id: PaymentProvider["id"]): PaymentProvider {
  const provider = providers.find((p) => p.id === id);
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}

export function getAvailablePaymentProviders(): PaymentProvider[] {
  return providers.filter((p) => p.isAvailable());
}
