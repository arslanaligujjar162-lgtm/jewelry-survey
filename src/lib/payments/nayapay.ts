import type { GatewayAdapter } from "./types";

// Placeholder until NayaPay supplies merchant API details. Fill in
// isConfigured (credentials present), createSession (start a hosted payment)
// and parseWebhook (verify signature on the raw body) — nothing else changes.
const NOT_READY = "NayaPay adapter is not implemented yet — waiting on merchant API details.";

export const nayapayAdapter: GatewayAdapter = {
  name: "nayapay",
  isConfigured: () => false,
  async createSession() {
    throw new Error(NOT_READY);
  },
  parseWebhook() {
    return null;
  },
};
