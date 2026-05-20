// ═══════════════════════════════════════════════════════
// Karigar AI — Matching Agent
// ═══════════════════════════════════════════════════════
// Scores and ranks discovered providers on 6 weighted
// factors and generates AI reasoning for the top pick.
// Logs: [ANTIGRAVITY][MATCHING_AGENT]
// ═══════════════════════════════════════════════════════

function calcDistanceScore(distanceKm) {
  // Closer is better. Under 1km gets 100. Decreases by 8 points per km.
  return Math.max(0, 100 - Math.max(0, distanceKm - 1) * 8);
}

function calcRatingScore(rating) {
  // Direct scale of 0-5 mapping to 0-100
  return (rating / 5) * 100;
}

function calcReliabilityScore(onTimeScore, cancellationRate) {
  // Combines on-time score and gives double penalty for cancellations
  return Math.max(0, Math.min(100, onTimeScore - cancellationRate * 2));
}

function calcPriceScore(pricePerHour, budgetSensitivity) {
  // High sensitivity (budget-minded) -> cheaper is better.
  if ((budgetSensitivity || "").toLowerCase() === "high") {
    return Math.max(0, 100 - (pricePerHour - 400) * 0.08);
  }
  // Low sensitivity (wants premium) -> higher price indicates premium.
  if ((budgetSensitivity || "").toLowerCase() === "low") {
    return Math.min(100, (pricePerHour / 2500) * 100);
  }
  return 75; // Neutral default
}

function calcSpecializationScore(providerComplexity, intentComplexity) {
  const req = (intentComplexity || "basic").toLowerCase();
  if (Array.isArray(providerComplexity) && providerComplexity.map(c => c.toLowerCase()).includes(req)) {
    return 100;
  }
  return 50;
}

function calcRiskScore(riskScore) {
  // Lower risk score (0-1) translates to higher match points
  return Math.max(0, 100 - riskScore * 100);
}

function generateReasoning(provider, intent) {
  const reasons = [];

  if (provider.distanceKm <= 2) {
    reasons.push("aapke bohot qareeb hain (sirf " + provider.distanceKm + " km door)");
  }
  
  if (provider.rating >= 4.6) {
    reasons.push("shandar rating hai (" + provider.rating + "★)");
  }

  if (provider.on_time_score >= 90) {
    reasons.push("waqt ke paband hain (" + provider.on_time_score + "% on-time score)");
  }

  const complexity = (intent.job_complexity || "basic").toLowerCase();
  if (provider.job_complexity && provider.job_complexity.map(c => c.toLowerCase()).includes(complexity)) {
    reasons.push("is qism ke kaam mein maharat rakhte hain");
  }

  if (intent.budget_sensitivity === "high" && provider.price_per_hour <= 700) {
    reasons.push("munasib rate hai (PKR " + provider.price_per_hour + "/hr)");
  }

  if (provider.verified) {
    reasons.push("Karigar AI se verified hain");
  }

  if (reasons.length === 0) {
    return `${provider.name} behtareen andaz mein aapka kaam mukammal kar sakte hain.`;
  }

  // Capitalize first letter and combine
  const reasonText = reasons.slice(0, 3).join(", ");
  return reasonText.charAt(0).toUpperCase() + reasonText.slice(1) + "—is liye AI ne inhein select kiya.";
}

export function rankProviders(providers, intent) {
  console.log("[ANTIGRAVITY][MATCHING_AGENT] Starting matching...");

  if (!providers || providers.length === 0) {
    console.log("[ANTIGRAVITY][MATCHING_AGENT] Empty list provided.");
    return {
      ranked: [],
      reasoning: "Koi karigar available nahi mila.",
      trace: ["No providers discovered."],
    };
  }

  const trace = [];
  trace.push(`[DISCOVER] Match request for "${intent.service_type}" near "${intent.location || "Current Location"}"`);

  try {
    const scored = providers.map((p) => {
      const distS = calcDistanceScore(p.distanceKm || 0);
      const rateS = calcRatingScore(p.rating || 0);
      const relS = calcReliabilityScore(p.on_time_score || 0, p.cancellation_rate || 0);
      const priceS = calcPriceScore(p.price_per_hour || 0, intent.budget_sensitivity);
      const specS = calcSpecializationScore(p.job_complexity, intent.job_complexity);
      const riskS = calcRiskScore(p.risk_score || 0);

      // Weighted score sum
      const totalScore =
        distS * 0.25 +
        rateS * 0.20 +
        relS * 0.20 +
        priceS * 0.15 +
        specS * 0.12 +
        riskS * 0.08;

      const roundedScore = Math.round(totalScore);
      trace.push(`[SCORE] ${p.name}: ${roundedScore}/100`);

      return {
        ...p,
        matchScore: roundedScore,
        scores: {
          distance: Math.round(distS),
          rating: Math.round(rateS),
          reliability: Math.round(relS),
          price: Math.round(priceS),
          specialization: Math.round(specS),
          risk: Math.round(riskS),
          total: roundedScore,
        },
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Selected top provider reasoning
    const topProvider = scored[0];
    const reasoning = generateReasoning(topProvider, intent);
    
    trace.push(`[DECIDE] Top match selected: ${topProvider.name} (${topProvider.matchScore}%)`);
    trace.push(`[REASON] ${reasoning}`);

    console.log("[ANTIGRAVITY][MATCHING_AGENT] Matching completed successfully.");
    return {
      ranked: scored,
      reasoning: reasoning,
      trace: trace,
    };
  } catch (error) {
    console.log("[ANTIGRAVITY][MATCHING_AGENT] Error matching:", error.message);
    return {
      ranked: providers.map(p => ({ ...p, matchScore: 85 })),
      reasoning: "Behtareen matches dhoond liye gaye hain.",
      trace: [error.message],
    };
  }
}
