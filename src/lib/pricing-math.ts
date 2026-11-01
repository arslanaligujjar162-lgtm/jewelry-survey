// Pure calculation functions behind the admin "Pricing" dashboard
// (/admin/pricing): the per-piece sourcing price calculator and the
// COD unit-economics / ad-spend reconciliation model.

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
