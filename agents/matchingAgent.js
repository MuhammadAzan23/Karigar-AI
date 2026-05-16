// ═══════════════════════════════════════════════════════
// Karigar AI — Matching Agent
// ═══════════════════════════════════════════════════════
// Scores and ranks discovered providers on 6 weighted
// factors and generates AI reasoning for the top pick.
// ═══════════════════════════════════════════════════════

/**
 * Calculates the distance score (25% weight).
 * Closer providers score higher.
 * @param {number} distanceKm - Distance in km
 * @returns {number} Score 0-100
 */
function calcDistanceScore(distanceKm) {
  return Math.max(0, 100 - distanceKm * 10);
}

/**
 * Calculates the rating score (20% weight).
 * @param {number} rating - Provider rating 0-5
 * @returns {number} Score 0-100
 */
function calcRatingScore(rating) {
  return (rating / 5) * 100;
}

/**
 * Calculates the reliability score (20% weight).
 * Based on on-time performance minus cancellation penalty.
 * @param {number} onTimeScore - On-time percentage
 * @param {number} cancellationRate - Cancellation percentage
 * @returns {number} Score 0-100
 */
function calcReliabilityScore(onTimeScore, cancellationRate) {
  return Math.max(0, Math.min(100, onTimeScore - cancellationRate * 2));
}

/**
 * Calculates the price score (15% weight).
 * Budget-sensitive users prefer cheaper providers.
 * @param {number} pricePerHour - Price in PKR
 * @param {string} budgetSensitivity - "low" | "medium" | "high"
 * @returns {number} Score 0-100
 */
function calcPriceScore(pricePerHour, budgetSensitivity) {
  if ((budgetSensitivity || "").toLowerCase() === "high") {
    return Math.max(0, 100 - (pricePerHour - 500) / 10);
  }
  return 70; // Neutral score for non-budget-conscious users
}

/**
 * Calculates the specialization match score (12% weight).
 * @param {string[]} providerComplexity - Provider's job_complexity array
 * @param {string} intentComplexity - Required job_complexity from intent
 * @returns {number} Score 0-100
 */
function calcSpecializationScore(providerComplexity, intentComplexity) {
  const required = (intentComplexity || "basic").toLowerCase();
  if (
    Array.isArray(providerComplexity) &&
    providerComplexity.map((c) => c.toLowerCase()).includes(required)
  ) {
    return 100;
  }
  return 50;
}

/**
 * Calculates the risk score (8% weight).
 * Lower risk = higher score.
 * @param {number} riskScore - Provider risk 0.0-1.0
 * @returns {number} Score 0-100
 */
function calcRiskScore(riskScore) {
  return Math.max(0, 100 - riskScore * 100);
}

/**
 * Generates human-readable reasoning for the top-ranked provider.
 * @param {object} provider - Top provider with all scores
 * @param {object} intent - Original intent object
 * @returns {string} Reasoning explanation
 */
function generateReasoning(provider, intent) {
  const reasons = [];

  // Distance
  if (provider.distanceKm <= 2) {
    reasons.push(`closest available (${provider.distanceKm}km)`);
  } else {
    reasons.push(`${provider.distanceKm}km away`);
  }

  // Reliability
  if (provider.on_time_score >= 90) {
    reasons.push(`highest reliability (${provider.on_time_score}%)`);
  } else {
    reasons.push(`reliability ${provider.on_time_score}%`);
  }

  // Specialization match
  const complexity = (intent.job_complexity || "basic").toLowerCase();
  if (
    provider.job_complexity &&
    provider.job_complexity.map((c) => c.toLowerCase()).includes(complexity)
  ) {
    reasons.push(`${intent.service_type} specialization match`);
  }

  // Budget
  if (
    intent.budget_sensitivity === "high" &&
    provider.price_per_hour <= 800
  ) {
    reasons.push("within budget");
  } else if (provider.price_per_hour <= 1000) {
    reasons.push("reasonable pricing");
  }

  // Rating
  if (provider.rating >= 4.5) {
    reasons.push(`top rated (${provider.rating}★)`);
  }

  // Verified
  if (provider.verified) {
    reasons.push("verified provider");
  }

  return `${provider.name} selected: ${reasons.join(", ")}`;
}

/**
 * Ranks discovered providers using a 6-factor weighted scoring system.
 *
 * @param {object[]} providers - Array of providers from discoveryAgent
 * @param {object} intent - Structured intent from intentAgent
 * @returns {{ ranked: object[], reasoning: string, trace: string[] }}
 */
export function rankProviders(providers, intent) {
  console.log("[ANTIGRAVITY][MATCHING_AGENT] ─────────────────────────────────");
  console.log(
    `[ANTIGRAVITY][MATCHING_AGENT] Scoring ${providers.length} providers on 6 factors...`
  );

  const trace = [];
  trace.push(
    `[DISCOVER] Found ${providers.length} providers for "${intent.service_type}" near ${intent.location || "user location"}`
  );
  trace.push(
    `[MATCH] Scoring ${providers.length} providers on 6 factors...`
  );

  try {
    const scored = providers.map((provider) => {
      // Calculate individual scores
      const distScore = calcDistanceScore(provider.distanceKm || 0);
      const ratingScore = calcRatingScore(provider.rating || 0);
      const reliabilityScore = calcReliabilityScore(
        provider.on_time_score || 0,
        provider.cancellation_rate || 0
      );
      const priceScore = calcPriceScore(
        provider.price_per_hour || 0,
        intent.budget_sensitivity
      );
      const specScore = calcSpecializationScore(
        provider.job_complexity,
        intent.job_complexity
      );
      const riskScoreVal = calcRiskScore(provider.risk_score || 0);

      // Weighted total
      const totalScore =
        distScore * 0.25 +
        ratingScore * 0.2 +
        reliabilityScore * 0.2 +
        priceScore * 0.15 +
        specScore * 0.12 +
        riskScoreVal * 0.08;

      const roundedTotal = Math.round(totalScore * 10) / 10;

      console.log(
        `[ANTIGRAVITY][MATCHING_AGENT]   ${provider.name}: ${roundedTotal}/100`
      );
      trace.push(`[SCORE] ${provider.name}: ${roundedTotal}/100`);

      return {
        ...provider,
        scores: {
          distance: Math.round(distScore * 10) / 10,
          rating: Math.round(ratingScore * 10) / 10,
          reliability: Math.round(reliabilityScore * 10) / 10,
          price: Math.round(priceScore * 10) / 10,
          specialization: Math.round(specScore * 10) / 10,
          risk: Math.round(riskScoreVal * 10) / 10,
          total: roundedTotal,
        },
      };
    });

    // Sort by total score descending
    scored.sort((a, b) => b.scores.total - a.scores.total);

    // Generate reasoning for top provider
    let reasoning = "No providers to rank.";
    if (scored.length > 0) {
      const top = scored[0];
      reasoning = generateReasoning(top, intent);

      console.log(
        `[ANTIGRAVITY][MATCHING_AGENT] Top: ${top.name} ${top.scores.total}/100`
      );
      console.log("[ANTIGRAVITY][MATCHING_AGENT] Decision made");

      trace.push(`[DECIDE] Selected: ${top.name}`);
      trace.push(
        `[REASON] ${reasoning}`
      );
    }

    console.log("[ANTIGRAVITY][MATCHING_AGENT] ─────────────────────────────────");

    return {
      ranked: scored,
      reasoning: reasoning,
      trace: trace,
    };
  } catch (error) {
    console.log("[ANTIGRAVITY][MATCHING_AGENT] Error:", error.message);
    console.log("[ANTIGRAVITY][MATCHING_AGENT] ─────────────────────────────────");
    return {
      ranked: [],
      reasoning: "Error occurred during matching.",
      trace: [`[ERROR] ${error.message}`],
    };
  }
}
