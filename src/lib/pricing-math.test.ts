import { describe, it, expect } from "vitest";
import {
  calculatePieceCost,
  checkPriceAgainstCost,
  calculateUnitEconomics,
  reconcileAdSpend,
  calculateRtoSensitivity,
  calculateAdPaymentTaxRate,
  countKnownSourcingCosts,
  evaluateReadinessStage,
  summarizeOrderLog,
  type PriceCalcInput,
  type UnitEconomicsInput,
  type CatalogProductOption,
  type ReadinessFlags,
  type AdOrderLogEntryLike,
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

describe("calculateRtoSensitivity", () => {
  const worked: UnitEconomicsInput = {
    price: 2200,
    discount: 0,
    deliveryChargeToCustomer: 0,
    landedCost: 550,
    packaging: 150,
    outboundCourier: 250,
    codFeeRatePct: 4,
    returnFee: 0,
    rtoRatePct: 999, // must be overridden per row, not read
    cancellationRatePct: 30,
  };

  it("reruns the break-even model at each RTO level, holding k fixed", () => {
    const rows = calculateRtoSensitivity(worked, [10, 20, 30]);
    expect(rows.map((r) => r.rtoRatePct)).toEqual([10, 20, 30]);
    // r=20% row must match the spreadsheet's own worked example exactly.
    const r20 = rows.find((r) => r.rtoRatePct === 20)!;
    expect(r20.breakEvenReportedRoas).toBeCloseTo(3.7, 2);
    // Break-even gets harder (higher ROAS needed) as RTO rises.
    expect(rows[0].breakEvenReportedRoas).toBeLessThan(rows[1].breakEvenReportedRoas);
    expect(rows[1].breakEvenReportedRoas).toBeLessThan(rows[2].breakEvenReportedRoas);
  });

  it("defaults to the 10/20/30% levels the brief recommends", () => {
    const rows = calculateRtoSensitivity(worked);
    expect(rows.map((r) => r.rtoRatePct)).toEqual([10, 20, 30]);
  });
});

describe("calculateAdPaymentTaxRate", () => {
  it("backs the real rate out of one card statement, per Section 7's REC", () => {
    // Debited Rs 10,170 against a Rs 10,000 Meta invoice = 1.7% overhead.
    expect(calculateAdPaymentTaxRate(10170, 10000)).toBeCloseTo(1.7, 5);
  });

  it("returns 0 instead of dividing by zero when no invoice amount is entered", () => {
    expect(calculateAdPaymentTaxRate(500, 0)).toBe(0);
  });
});

describe("countKnownSourcingCosts", () => {
  const products: CatalogProductOption[] = [
    { id: "1", name: "Mermaid Tear", priceRs: 3000, image: "/products/mermaid-tear-1.jpg" },
    { id: "2", name: "Some New SKU", priceRs: 3000, image: "/products/some-new-sku-1.jpg" },
    { id: "3", name: "Moon Drop", priceRs: 2500, image: "/products/moon-drop-1.jpg" },
  ];

  it("counts only products with a recorded sourcing default", () => {
    // Mermaid Tear and Moon Drop are in SOURCING_DEFAULTS; Some New SKU is not.
    expect(countKnownSourcingCosts(products)).toEqual({ known: 2, total: 3 });
  });

  it("covers all four founder-confirmed renames (Black/Green Olive, Confetti Studs, Eclipse Drop)", () => {
    const renamed: CatalogProductOption[] = [
      { id: "4", name: "Black Olive", priceRs: 3000, image: "x" },
      { id: "5", name: "Green Olive", priceRs: 3000, image: "x" },
      { id: "6", name: "Confetti Studs", priceRs: 3000, image: "x" },
      { id: "7", name: "Eclipse Drop", priceRs: 2500, image: "x" },
    ];
    expect(countKnownSourcingCosts(renamed)).toEqual({ known: 4, total: 4 });
  });
});

describe("evaluateReadinessStage", () => {
  const allTrue: ReadinessFlags = {
    allSkuCostsKnown: true,
    orderLogLive: true,
    purchaseEventTested: true,
    confirmationStepBeforeDispatch: true,
    maxTestBudgetSet: true,
    conversionPathChosen: true,
    tracksReconcile2Weeks: true,
    enoughDeliveredOrdersToCompare: true,
    contributionAfterAdsPositive: true,
    holdsAcrossCreativeRefresh: true,
    stockCanAbsorbMoreOrders: true,
  };
  const allFalse: ReadinessFlags = Object.fromEntries(
    Object.keys(allTrue).map((k) => [k, false]),
  ) as unknown as ReadinessFlags;

  it("is not-ready when the Section 4D blockers are unmet", () => {
    const { stage, blockingNextStage } = evaluateReadinessStage(allFalse);
    expect(stage).toBe("not-ready");
    expect(blockingNextStage).toContain("orderLogLive");
  });

  it("reaches ready-to-scale only once every flag is true", () => {
    const { stage, blockingNextStage } = evaluateReadinessStage(allTrue);
    expect(stage).toBe("ready-to-scale");
    expect(blockingNextStage).toEqual([]);
  });

  it("stops at controlled-testing when later-stage flags aren't met yet", () => {
    const { stage, blockingNextStage } = evaluateReadinessStage({
      ...allTrue,
      tracksReconcile2Weeks: false,
      contributionAfterAdsPositive: false,
    });
    expect(stage).toBe("controlled-testing");
    expect(blockingNextStage).toContain("tracksReconcile2Weeks");
  });

  it("does not let a later-stage flag compensate for a missing earlier one", () => {
    // Everything about scaling is true, but the order log still isn't live —
    // must not be reported as ready-to-scale.
    const { stage } = evaluateReadinessStage({ ...allTrue, orderLogLive: false });
    expect(stage).toBe("not-ready");
  });
});

describe("summarizeOrderLog", () => {
  // Modelled on the brief's Section 6 finding: ~100 placed, ~63 ship,
  // ~1 in 5 shipped parcels come back, ~49-57 end with cash collected.
  const entries: AdOrderLogEntryLike[] = [
    ...Array(37).fill({ status: "cancelled", revenue: 2200, cashCollected: null }),
    ...Array(13).fill({ status: "rto", revenue: 2200, cashCollected: null }),
    ...Array(5).fill({ status: "shipped", revenue: 2200, cashCollected: null }),
    ...Array(45).fill({ status: "delivered", revenue: 2200, cashCollected: 2200 }),
  ];

  it("computes k (cancellation rate) against every placed order", () => {
    const { cancellationRatePct, totalPlaced, totalCancelled } = summarizeOrderLog(entries);
    expect(totalPlaced).toBe(100);
    expect(totalCancelled).toBe(37);
    expect(cancellationRatePct).toBeCloseTo(37, 5);
  });

  it("computes r (RTO rate) against shipped orders only, not all placed", () => {
    const { rtoRatePct, totalShipped, totalRto } = summarizeOrderLog(entries);
    // shipped = delivered + rto + still-in-transit = 45 + 13 + 5 = 63
    expect(totalShipped).toBe(63);
    expect(totalRto).toBe(13);
    expect(rtoRatePct).toBeCloseTo((13 / 63) * 100, 5);
  });

  it("totals cash actually collected, not the face value of delivered orders", () => {
    const mixed: AdOrderLogEntryLike[] = [
      { status: "delivered", revenue: 2200, cashCollected: 2000 }, // partial/discounted collection
      { status: "delivered", revenue: 2200, cashCollected: 2200 },
      { status: "rto", revenue: 2200, cashCollected: null },
    ];
    expect(summarizeOrderLog(mixed).totalCashCollected).toBe(4200);
    expect(summarizeOrderLog(mixed).totalRevenuePlaced).toBe(6600);
  });

  it("returns 0 rates instead of NaN when the log is empty", () => {
    const summary = summarizeOrderLog([]);
    expect(summary.cancellationRatePct).toBe(0);
    expect(summary.rtoRatePct).toBe(0);
    expect(summary.totalPlaced).toBe(0);
  });
});
