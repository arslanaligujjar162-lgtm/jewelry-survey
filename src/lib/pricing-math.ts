// Pure calculation functions behind the admin "Pricing" dashboard
// (/admin/pricing): the per-piece sourcing price calculator and the
// COD unit-economics / ad-spend reconciliation model.

export type CostMode = "rmb" | "pkr";

export interface SourcingProduct {
  name: string;
  rmb: number;
  weightGrams: number;
}

// Ported from the standalone 1720 pricing calculator (sourcing cost in RMB,
// landed weight in grams) so the product picker keeps working unchanged.
export const SOURCING_PRODUCTS: SourcingProduct[] = [
  { name: "Confetti Hoop", rmb: 17, weightGrams: 30 },
  { name: "Mermaid Tear", rmb: 17, weightGrams: 30 },
  { name: "Moon Drop", rmb: 15, weightGrams: 30 },
  { name: "Pearl Drop", rmb: 15, weightGrams: 30 },
  { name: "Vogue Hoop", rmb: 22, weightGrams: 7 },
  { name: "Trinket Cuff", rmb: 9, weightGrams: 2 },
  { name: "Deco Link", rmb: 15, weightGrams: 16 },
  { name: "Baroque Link", rmb: 15, weightGrams: 16 },
  { name: "Ribbon Hoop", rmb: 10, weightGrams: 9 },
  { name: "Cascade Drop", rmb: 15, weightGrams: 8 },
  { name: "Gala Stud", rmb: 13, weightGrams: 7 },
  { name: "Sunray Stud", rmb: 13, weightGrams: 7 },
  { name: "Jet Hoop", rmb: 17, weightGrams: 30 },
  { name: "Olive Hoop", rmb: 17, weightGrams: 30 },
  { name: "Hammered Band", rmb: 4, weightGrams: 30 },
  { name: "OG Ring", rmb: 21, weightGrams: 10 },
  { name: "Starlet Ring", rmb: 17, weightGrams: 14 },
  { name: "Studded Band", rmb: 13, weightGrams: 3 },
  { name: "Whisper Band", rmb: 15.5, weightGrams: 30 },
  { name: "Channel Bangle", rmb: 15, weightGrams: 14 },
  { name: "Confetti Bangle", rmb: 38, weightGrams: 30 },
  { name: "Clover Pendant", rmb: 16, weightGrams: 5 },
];

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
