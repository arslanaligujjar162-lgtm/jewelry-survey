import { describe, it, expect } from "vitest";
import {
  calculatePieceCost,
  checkPriceAgainstCost,
  calculateUnitEconomics,
  reconcileAdSpend,
  type PriceCalcInput,
  type UnitEconomicsInput,
} from "./pricing-math";

describe("calculatePieceCost", () => {
  const base: PriceCalcInput = {
    costMode: "rmb",
    productCostRmb: 17,
    exchangeRate: 39.5,
    productCostPkr: 0,
    agentFeePct: 10,
    freightRatePerKg: 4000,
    unitWeightGrams: 30,
    customsDuty: 0,
    packagingCost: 98.98,
    courierFee: 200,
    codFee: 0,
    rtoEnabled: false,
    rtoRatePct: 15,
    targetMarginPct: 50,
  };

  it("matches the standalone calculator's defaults with RTO off", () => {
    const result = calculatePieceCost(base);
    // 17 * 39.5 = 671.5; +10% agent fee = 738.65; freight 4000*0.03 = 120; customs 0
    expect(result.baseProductCost).toBeCloseTo(858.65, 2);
    expect(result.rtoAdjustment).toBe(0);
    expect(result.totalCostPerPieceSold).toBeCloseTo(858.65 + 98.98 + 200, 2);
    // 50% margin: price = cost / 0.5
    expect(result.suggestedPrice).toBeCloseTo(result.totalCostPerPieceSold * 2, 2);
    expect(result.profitAtSuggestedPrice).toBeCloseTo(result.totalCostPerPieceSold, 2);
  });

  it("spreads packaging + courier cost over the RTO rate when enabled", () => {
    const result = calculatePieceCost({ ...base, rtoEnabled: true, rtoRatePct: 20 });
    const perAttempt = 98.98 + 200;
    // 1 / (1 - 0.2) = 1.25x
    expect(result.rtoAdjustment).toBeCloseTo(perAttempt * 0.25, 2);
  });

  it("reads cost directly in PKR mode and ignores the RMB fields", () => {
    const result = calculatePieceCost({ ...base, costMode: "pkr", productCostPkr: 1000 });
    expect(result.productCostPkr).toBe(1000);
  });

  it("clamps an out-of-range target margin to 95%", () => {
    const result = calculatePieceCost({ ...base, targetMarginPct: 150 });
    expect(result.suggestedPrice).toBeCloseTo(result.totalCostPerPieceSold / 0.05, 2);
  });
});

describe("checkPriceAgainstCost", () => {
  it("computes profit and margin at a chosen selling price", () => {
    const { profit, marginPct } = checkPriceAgainstCost(2000, 1000);
    expect(profit).toBe(1000);
    expect(marginPct).toBe(50);
  });

  it("returns a zero margin instead of dividing by zero at Rs 0", () => {
    expect(checkPriceAgainstCost(0, 500).marginPct).toBe(0);
  });
});

describe("calculateUnitEconomics", () => {
  // The 1720 spreadsheet's own worked example: Rs 2,200 price, free delivery,
  // Rs 550 landed cost, Rs 150 packaging, Rs 250 outbound courier, 4% COD fee,
  // 30% cancellation (k), 20% RTO (r).
  const worked: UnitEconomicsInput = {
    price: 2200,
    discount: 0,
    deliveryChargeToCustomer: 0,
    landedCost: 550,
    packaging: 150,
    outboundCourier: 250,
    codFeeRatePct: 4,
    returnFee: 0,
    rtoRatePct: 20,
    cancellationRatePct: 30,
  };

  it("reproduces every figure in the spreadsheet's worked break-even example", () => {
    const result = calculateUnitEconomics(worked);
    expect(result.revenue).toBe(2200);
    expect(result.codFee).toBe(88);
    expect(result.contributionPerDeliveredOrder).toBe(1162);
    expect(result.lossPerRtoParcel).toBe(400);
    expect(result.naiveBreakEvenRoas).toBeCloseTo(1.89, 2);
    expect(result.expectedContributionPerShippedOrder).toBeCloseTo(849.6, 2);
    expect(result.expectedContributionPerPlacedOrder).toBeCloseTo(594.72, 2);
    expect(result.breakEvenReportedRoas).toBeCloseTo(3.7, 2);
    expect(result.breakEvenCostPerDeliveredOrder).toBe(1062);
  });

  it("rounds the COD fee up, not to the nearest value", () => {
    // Revenue 2201 at 4% = 88.04 -> ROUNDUP, not ROUND, so it must hit 89.
    const result = calculateUnitEconomics({ ...worked, price: 2201 });
    expect(result.codFee).toBe(89);
  });
});

describe("reconcileAdSpend", () => {
  it("derives actual cost, ROAS, and contribution after ads from a real order log", () => {
    const result = reconcileAdSpend({
      spend: 50000,
      placedOrders: 100,
      deliveredOrders: 70,
      exchangedOrReturnedAfterDelivery: 5,
      rtoOrders: 20,
      metaPurchaseValue: 220000,
      cashCollectedRevenue: 154000,
      taxAndFeeRatePctOnAdPayments: 17,
      contributionPerDeliveredOrder: 1162,
      lossPerRtoParcel: 400,
    });

    expect(result.actualCostPerPlacedOrder).toBe(500);
    expect(result.costPerDeliveredOrder).toBeCloseTo(714.29, 2);
    expect(result.costPerRetainedOrder).toBeCloseTo(769.23, 2);
    expect(result.reportedRoas).toBe(4.4);
    expect(result.reconciledRoas).toBe(3.08);
    // 70 * 1162 - 20 * 400 - 50000 = 81340 - 8000 - 50000
    expect(result.contributionAfterAds).toBe(23340);
    expect(result.trueAdCost).toBe(58500);
  });
});
