export function generateQuote(provider, intent) {
  console.log("[ANTIGRAVITY][PRICING_AGENT] Calculating quote");

  const BASE = provider.price_per_hour || 800;
  console.log(`[ANTIGRAVITY][PRICING_AGENT] Base rate: PKR ${BASE}`);

  const VISIT_FEE = 300;

  let DISTANCE = 350;
  const distanceKm = provider.distanceKm || provider.distance || 5;
  if (distanceKm <= 2) {
    DISTANCE = 100;
  } else if (distanceKm <= 5) {
    DISTANCE = 200;
  }

  let COMPLEXITY = 0;
  if (intent.job_complexity === "intermediate") {
    COMPLEXITY = 150;
  } else if (intent.job_complexity === "complex") {
    COMPLEXITY = 300;
  }

  let URGENCY = 0;
  if (intent.urgency === "high") {
    URGENCY = 200;
  } else if (intent.urgency === "medium") {
    URGENCY = 100;
  }

  let DISCOUNT = 0;
  let budgetNote = null;
  if (intent.budget_sensitivity === "high") {
    DISCOUNT = Math.round(BASE * 0.1); // 10% off
    budgetNote = "Budget-friendly rate applied";
  }

  let SURGE = 0;
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 10) {
    SURGE = 100;
  } else if (hour >= 18 && hour <= 20) {
    SURGE = 150;
  }

  const TOTAL = VISIT_FEE + DISTANCE + BASE + COMPLEXITY + URGENCY + SURGE - DISCOUNT;

  console.log(`[ANTIGRAVITY][PRICING_AGENT] Adjustments: ${TOTAL - BASE}`);
  console.log(`[ANTIGRAVITY][PRICING_AGENT] Total: PKR ${TOTAL}`);

  return {
    visitFee: VISIT_FEE,
    distanceCharge: DISTANCE,
    serviceCharge: BASE,
    complexityCharge: COMPLEXITY,
    urgencyAdjustment: URGENCY,
    surgeCharge: SURGE,
    discount: DISCOUNT,
    total: TOTAL,
    budgetNote: budgetNote,
    breakdown: [
      { label: "Visit Fee", value: VISIT_FEE },
      { label: "Distance Charge", value: DISTANCE },
      { label: "Service Charge", value: BASE },
      { label: "Complexity Charge", value: COMPLEXITY },
      { label: "Urgency Adjustment", value: URGENCY },
      { label: "Surge Charge", value: SURGE },
    ],
  };
}
