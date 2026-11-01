// Pure calculation functions behind the admin "Pricing" dashboard
// (/admin/pricing): the per-piece sourcing price calculator and the
// COD unit-economics / ad-spend reconciliation model.

import type { AdOrderLogStatus } from "@/lib/types";

export type CostMode = "rmb" | "pkr";

// A product as picked from the live catalog (Supabase in production, the
// local fallback seed otherwise) — real name, real selling price, real
// photo, not a hand-typed guess.
export interface CatalogProductOption {
  id: string;
  name: string;
  /** The real, current selling price on the storefront. */
  priceRs: number;
  /** Path to a real product photo (white background), e.g. "/products/foo-1.jpg". */
  image: string;
}

export interface SourcingDefault {
  rmbCost: number;
  weightGrams: number;
}

// Best-known sourcing cost (¥) and landed weight (g) per catalog product
// name, carried over from the original sourcing worksheet. Only products
// whose name matches the live catalog exactly are listed here — guessing a
// number for a product this wasn't recorded against would silently misstate
// its margin, so an unmatched product is left for the user to fill in.
export const SOURCING_DEFAULTS: Record<string, SourcingDefault> = {
  "Mermaid Tear": { rmbCost: 17, weightGrams: 30 },
  "Moon Drop": { rmbCost: 15, weightGrams: 30 },
  "Vogue Hoop": { rmbCost: 22, weightGrams: 7 },
  "Trinket Cuff": { rmbCost: 9, weightGrams: 2 },
  "Deco Link": { rmbCost: 15, weightGrams: 16 },
  "Baroque Link": { rmbCost: 15, weightGrams: 16 },
  "Ribbon Hoop": { rmbCost: 10, weightGrams: 9 },
  "Cascade Drop": { rmbCost: 15, weightGrams: 8 },
  "Gala Studs": { rmbCost: 13, weightGrams: 7 },
  "Sunray Studs": { rmbCost: 13, weightGrams: 7 },
  "Hammered Band": { rmbCost: 4, weightGrams: 30 },
  "The OG Ring": { rmbCost: 21, weightGrams: 10 },
  "Starlet Ring": { rmbCost: 17, weightGrams: 14 },
  "Studded Band": { rmbCost: 13, weightGrams: 3 },
  "Whisper Band": { rmbCost: 15.5, weightGrams: 30 },
  "Channel Bangle": { rmbCost: 15, weightGrams: 14 },
  "Confetti Bangle": { rmbCost: 38, weightGrams: 30 },
  "Clover Pendant": { rmbCost: 16, weightGrams: 5 },
};

function safeDiv(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

// Both calculators cap rate inputs at 95% — a rate at or above 100% makes
// "per successful outcome" costs divide by zero or go negative, which is
// never a real scenario, so the UI (and these functions) refuse to model it.
function clampRatePct(pct: number): number {
  return Math.min(Math.max(pct, 0), 95);
}

// --- Per-piece sourcing price calculator -----------------------------------

export interface PriceCalcInput {
  costMode: CostMode;
  productCostRmb: number;
  exchangeRate: number;
  productCostPkr: number;
  agentFeePct: number;
  freightRatePerKg: number;
  unitWeightGrams: number;
  customsDuty: number;
  packagingCost: number;
  courierFee: number;
  codFee: number;
  rtoEnabled: boolean;
  rtoRatePct: number;
  targetMarginPct: number;
}

export interface PriceCalcResult {
  productCostPkr: number;
  agentFee: number;
  freight: number;
  customsDuty: number;
  baseProductCost: number;
  packagingCost: number;
  courierAndCodCost: number;
  rtoAdjustment: number;
  totalCostPerPieceSold: number;
  suggestedPrice: number;
  profitAtSuggestedPrice: number;
}

export function calculatePieceCost(input: PriceCalcInput): PriceCalcResult {
  const productCostPkr =
    input.costMode === "rmb" ? input.productCostRmb * input.exchangeRate : input.productCostPkr;
  const agentFee = productCostPkr * (input.agentFeePct / 100);
  const freight = input.freightRatePerKg * (input.unitWeightGrams / 1000);
  const customsDuty = input.customsDuty;
  const baseProductCost = productCostPkr + agentFee + freight + customsDuty;

  const perAttemptCost = input.packagingCost + input.courierFee + input.codFee;

  const rtoRatePct = clampRatePct(input.rtoRatePct);
  // Every RTO parcel still cost packaging + courier; spreading that over the
  // orders that *do* sell means dividing by the share that don't come back.
  const unitsPerSuccessfulSale =
    input.rtoEnabled && rtoRatePct > 0 ? 1 / (1 - rtoRatePct / 100) : 1;
  const totalAttemptCost = perAttemptCost * unitsPerSuccessfulSale;
  const rtoAdjustment = totalAttemptCost - perAttemptCost;

  const totalCostPerPieceSold = baseProductCost + totalAttemptCost;

  const targetMarginPct = clampRatePct(input.targetMarginPct);
  const suggestedPrice = totalCostPerPieceSold / (1 - targetMarginPct / 100);
  const profitAtSuggestedPrice = suggestedPrice - totalCostPerPieceSold;

  return {
    productCostPkr,
    agentFee,
    freight,
    customsDuty,
    baseProductCost,
    packagingCost: input.packagingCost,
    courierAndCodCost: input.courierFee + input.codFee,
    rtoAdjustment,
    totalCostPerPieceSold,
    suggestedPrice,
    profitAtSuggestedPrice,
  };
}

export interface PriceCheckResult {
  profit: number;
  marginPct: number;
}

export function checkPriceAgainstCost(yourPrice: number, totalCostPerPieceSold: number): PriceCheckResult {
  const profit = yourPrice - totalCostPerPieceSold;
  const marginPct = safeDiv(profit, yourPrice) * 100;
  return { profit, marginPct };
}

// --- COD unit economics & ad-spend reconciliation ---------------------------
//
// Formulas straight from the 1720 spreadsheet: r = RTO rate (refused/returned
// ÷ shipped), k = cancellation rate (cancelled before dispatch ÷ placed).

export interface UnitEconomicsInput {
  price: number;
  discount: number;
  deliveryChargeToCustomer: number;
  landedCost: number;
  packaging: number;
  outboundCourier: number;
  codFeeRatePct: number;
  returnFee: number;
  rtoRatePct: number;
  cancellationRatePct: number;
}

export interface UnitEconomicsResult {
  revenue: number;
  grossProfit: number;
  codFee: number;
  contributionPerDeliveredOrder: number;
  lossPerRtoParcel: number;
  naiveBreakEvenRoas: number;
  expectedContributionPerShippedOrder: number;
  expectedContributionPerPlacedOrder: number;
  breakEvenCostPerPlacedOrder: number;
  breakEvenCostPerDeliveredOrder: number;
  breakEvenReportedRoas: number;
}

export function calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsResult {
  const revenue = input.price - input.discount + input.deliveryChargeToCustomer;
  const grossProfit = revenue - input.landedCost;
  const codFee = Math.ceil(revenue * (input.codFeeRatePct / 100));

  const contributionPerDeliveredOrder = revenue - input.landedCost - input.packaging - input.outboundCourier - codFee;
  const lossPerRtoParcel = input.outboundCourier + input.packaging + input.returnFee;

  const r = clampRatePct(input.rtoRatePct) / 100;
  const k = clampRatePct(input.cancellationRatePct) / 100;

  const naiveBreakEvenRoas = safeDiv(revenue, contributionPerDeliveredOrder);

  const expectedContributionPerShippedOrder = (1 - r) * contributionPerDeliveredOrder - r * lossPerRtoParcel;
  const expectedContributionPerPlacedOrder = (1 - k) * expectedContributionPerShippedOrder;
  // Same number, two names: it's both the most you can let a placed order
  // cost (ad spend + everything else) and the break-even point for it.
  const breakEvenCostPerPlacedOrder = expectedContributionPerPlacedOrder;
  const breakEvenCostPerDeliveredOrder = contributionPerDeliveredOrder - safeDiv(r, 1 - r) * lossPerRtoParcel;
  const breakEvenReportedRoas = safeDiv(revenue, expectedContributionPerPlacedOrder);

  return {
    revenue,
    grossProfit,
    codFee,
    contributionPerDeliveredOrder,
    lossPerRtoParcel,
    naiveBreakEvenRoas,
    expectedContributionPerShippedOrder,
    expectedContributionPerPlacedOrder,
    breakEvenCostPerPlacedOrder,
    breakEvenCostPerDeliveredOrder,
    breakEvenReportedRoas,
  };
}

// Section 6 of the Meta Ads Phase 1 brief: "run the economics at three
// levels (r = 10%, 20%, 30%) and only proceed if the plan survives the 20%
// case" — your own RTO rate isn't known yet, so show the break-even at each
// level instead of a single number that assumes you already know it.
export interface RtoSensitivityRow extends UnitEconomicsResult {
  rtoRatePct: number;
}

export function calculateRtoSensitivity(
  input: UnitEconomicsInput,
  rtoLevelsPct: number[] = [10, 20, 30],
): RtoSensitivityRow[] {
  return rtoLevelsPct.map((rtoRatePct) => ({
    rtoRatePct,
    ...calculateUnitEconomics({ ...input, rtoRatePct }),
  }));
}

// Section 7's `[REC]`: don't trust published ad-payment tax/fee rates (they
// range from 0.5% to 17% across sources) — read one real card statement that
// includes a Meta charge and back the rate out directly.
export function calculateAdPaymentTaxRate(totalDebitedRs: number, metaInvoiceRs: number): number {
  return safeDiv(totalDebitedRs - metaInvoiceRs, metaInvoiceRs) * 100;
}

// Section 4A: how many of the live catalog's products have a recorded
// sourcing cost, vs. ones still needing a manual entry before their margin
// can be trusted.
export function countKnownSourcingCosts(products: CatalogProductOption[]): { known: number; total: number } {
  const known = products.filter((p) => SOURCING_DEFAULTS[p.name] !== undefined).length;
  return { known, total: products.length };
}

// --- Readiness test (Section 4D) --------------------------------------------

export type ReadinessStage = "not-ready" | "controlled-testing" | "structured-optimisation" | "ready-to-scale";

export interface ReadinessFlags {
  /** Auto-computed from the live catalog, not self-reported. */
  allSkuCostsKnown: boolean;
  orderLogLive: boolean;
  purchaseEventTested: boolean;
  confirmationStepBeforeDispatch: boolean;
  maxTestBudgetSet: boolean;
  conversionPathChosen: boolean;
  tracksReconcile2Weeks: boolean;
  enoughDeliveredOrdersToCompare: boolean;
  contributionAfterAdsPositive: boolean;
  holdsAcrossCreativeRefresh: boolean;
  stockCanAbsorbMoreOrders: boolean;
}

export interface ReadinessEvaluation {
  stage: ReadinessStage;
  /** Flags still unmet that are blocking the next stage up. */
  blockingNextStage: (keyof ReadinessFlags)[];
}

const STAGE_REQUIREMENTS: { stage: ReadinessStage; requires: (keyof ReadinessFlags)[] }[] = [
  {
    stage: "controlled-testing",
    requires: [
      "allSkuCostsKnown",
      "orderLogLive",
      "purchaseEventTested",
      "confirmationStepBeforeDispatch",
      "maxTestBudgetSet",
      "conversionPathChosen",
    ],
  },
  {
    stage: "structured-optimisation",
    requires: ["tracksReconcile2Weeks", "enoughDeliveredOrdersToCompare"],
  },
  {
    stage: "ready-to-scale",
    requires: ["contributionAfterAdsPositive", "holdsAcrossCreativeRefresh", "stockCanAbsorbMoreOrders"],
  },
];

export function evaluateReadinessStage(flags: ReadinessFlags): ReadinessEvaluation {
  let stage: ReadinessStage = "not-ready";
  let blockingNextStage: (keyof ReadinessFlags)[] = STAGE_REQUIREMENTS[0].requires.filter((key) => !flags[key]);

  for (const { stage: candidateStage, requires } of STAGE_REQUIREMENTS) {
    const unmet = requires.filter((key) => !flags[key]);
    if (unmet.length > 0) {
      blockingNextStage = unmet;
      break;
    }
    stage = candidateStage;
    const nextIndex = STAGE_REQUIREMENTS.findIndex((s) => s.stage === candidateStage) + 1;
    blockingNextStage = STAGE_REQUIREMENTS[nextIndex]?.requires.filter((key) => !flags[key]) ?? [];
  }

  return { stage, blockingNextStage };
}

// --- Order log summary ------------------------------------------------------
//
// Turns raw ad_order_log rows into the r and k the rest of this module
// expects, computed from real orders instead of guessed — the whole point
// of Section 4B's "most important measurement tool you own".

export interface AdOrderLogEntryLike {
  status: AdOrderLogStatus;
  revenue: number;
  cashCollected: number | null;
}

export interface AdOrderLogSummary {
  totalPlaced: number;
  totalCancelled: number;
  /** Dispatched at all: shipped + delivered + rto. */
  totalShipped: number;
  totalDelivered: number;
  totalRto: number;
  /** Shipped but not yet resolved either way. */
  stillInTransit: number;
  /** k = cancelled ÷ placed. */
  cancellationRatePct: number;
  /** r = refused/returned ÷ shipped. */
  rtoRatePct: number;
  totalCashCollected: number;
  totalRevenuePlaced: number;
}

export function summarizeOrderLog(entries: AdOrderLogEntryLike[]): AdOrderLogSummary {
  const totalPlaced = entries.length;
  const totalCancelled = entries.filter((e) => e.status === "cancelled").length;
  const totalDelivered = entries.filter((e) => e.status === "delivered").length;
  const totalRto = entries.filter((e) => e.status === "rto").length;
  const stillInTransit = entries.filter((e) => e.status === "shipped").length;
  const totalShipped = stillInTransit + totalDelivered + totalRto;
  const cancellationRatePct = safeDiv(totalCancelled, totalPlaced) * 100;
  const rtoRatePct = safeDiv(totalRto, totalShipped) * 100;
  const totalCashCollected = entries.reduce((sum, e) => sum + (e.cashCollected ?? 0), 0);
  const totalRevenuePlaced = entries.reduce((sum, e) => sum + e.revenue, 0);

  return {
    totalPlaced,
    totalCancelled,
    totalShipped,
    totalDelivered,
    totalRto,
    stillInTransit,
    cancellationRatePct,
    rtoRatePct,
    totalCashCollected,
    totalRevenuePlaced,
  };
}

export interface AdSpendReconciliationInput {
  spend: number;
  placedOrders: number;
  deliveredOrders: number;
  exchangedOrReturnedAfterDelivery: number;
  rtoOrders: number;
  metaPurchaseValue: number;
  cashCollectedRevenue: number;
  taxAndFeeRatePctOnAdPayments: number;
  contributionPerDeliveredOrder: number;
  lossPerRtoParcel: number;
}

export interface AdSpendReconciliationResult {
  actualCostPerPlacedOrder: number;
  costPerDeliveredOrder: number;
  costPerRetainedOrder: number;
  reportedRoas: number;
  reconciledRoas: number;
  contributionAfterAds: number;
  trueAdCost: number;
}

export function reconcileAdSpend(input: AdSpendReconciliationInput): AdSpendReconciliationResult {
  const retainedOrders = input.deliveredOrders - input.exchangedOrReturnedAfterDelivery;

  const actualCostPerPlacedOrder = safeDiv(input.spend, input.placedOrders);
  const costPerDeliveredOrder = safeDiv(input.spend, input.deliveredOrders);
  const costPerRetainedOrder = safeDiv(input.spend, retainedOrders);
  const reportedRoas = safeDiv(input.metaPurchaseValue, input.spend);
  const reconciledRoas = safeDiv(input.cashCollectedRevenue, input.spend);
  const contributionAfterAds =
    input.deliveredOrders * input.contributionPerDeliveredOrder -
    input.rtoOrders * input.lossPerRtoParcel -
    input.spend;
  const trueAdCost = input.spend * (1 + input.taxAndFeeRatePctOnAdPayments / 100);

  return {
    actualCostPerPlacedOrder,
    costPerDeliveredOrder,
    costPerRetainedOrder,
    reportedRoas,
    reconciledRoas,
    contributionAfterAds,
    trueAdCost,
  };
}
