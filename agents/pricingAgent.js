// ═══════════════════════════════════════════════════════
// Karigar AI — Pricing Agent
// ═══════════════════════════════════════════════════════
// Calculates dynamic price quotes containing visit fees,
// complexity premiums, urgency surcharges, and discounts.
// Logs: [ANTIGRAVITY][PRICING_AGENT]
// ═══════════════════════════════════════════════════════

export function generateQuote(provider, intent) {
  console.log(`[ANTIGRAVITY][PRICING_AGENT] Generating quote for ${provider.name}...`);

  try {
    const baseRate = provider.price_per_hour;
    const distanceKm = provider.distanceKm || 1.5;

    // 1. Visit Fee (flat rate)
    const visitFee = 250;

    // 2. Distance Fee (PKR 30 per km)
    const distanceFee = Math.round(distanceKm * 30);

    // 3. Complexity Multiplier
    let complexityMultiplier = 1.0;
    const complexity = (intent.job_complexity || "basic").toLowerCase();
    if (complexity === "intermediate") {
      complexityMultiplier = 1.35;
    } else if (complexity === "complex") {
      complexityMultiplier = 1.75;
    }
    const serviceFee = Math.round(baseRate * complexityMultiplier);

    // 4. Urgency Surcharge
    let urgencyFee = 0;
    const urgency = (intent.urgency || "medium").toLowerCase();
    if (urgency === "high") {
      urgencyFee = 250; // Urgent ASAP fee
    } else if (urgency === "medium") {
      urgencyFee = 100;
    }

    // 5. Surge Charge (simulated peak pricing during nights or high demands)
    let surgeFee = 0;
    const preferredTime = (intent.preferred_time || "").toLowerCase();
    if (preferredTime.includes("night") || preferredTime.includes("raat") || urgency === "high") {
      surgeFee = 150; // Night / Peak demand surge
    }

    // 6. Rating/Promo Discount
    let discount = 0;
    if (provider.rating >= 4.7) {
      discount = 120; // 120 PKR discount for top-rated karigars
    }

    // Total Calculation
    const total = Math.max(0, visitFee + distanceFee + serviceFee + urgencyFee + surgeFee - discount);

    // Formulate a user-friendly Pakistani-targeted budget note
    let budgetNote = "";
    if (intent.budget_sensitivity === "high" && total > 1500) {
      budgetNote = "Rates are slightly higher due to job complexity, but we ensured high reliability.";
    } else if (discount > 0) {
      budgetNote = "Top-Rated discount of PKR " + discount + " applied successfully!";
    }

    const quote = {
      baseRate,
      visitFee,
      distanceFee,
      serviceFee,
      urgencyFee,
      surgeFee,
      discount,
      total,
      budgetNote,
      currency: "PKR",
    };

    console.log(`[ANTIGRAVITY][PRICING_AGENT] Quote generated. Total: PKR ${total}`);
    return quote;
  } catch (error) {
    console.log("[ANTIGRAVITY][PRICING_AGENT] Error generating quote:", error.message);
    // Safe standard fallback quote
    return {
      baseRate: provider.price_per_hour,
      visitFee: 250,
      distanceFee: 50,
      serviceFee: provider.price_per_hour,
      urgencyFee: 0,
      surgeFee: 0,
      discount: 0,
      total: provider.price_per_hour + 300,
      budgetNote: "",
      currency: "PKR",
    };
  }
}
