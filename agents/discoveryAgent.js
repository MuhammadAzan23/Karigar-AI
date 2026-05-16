// ═══════════════════════════════════════════════════════
// Karigar AI — Discovery Agent
// ═══════════════════════════════════════════════════════
// Filters and discovers nearby service providers based
// on intent, distance, and availability.
// ═══════════════════════════════════════════════════════

import providersData from "../data/providers.json";

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Maps preferred_time string to availability slot keywords.
 * @param {string} preferredTime - Time preference from intent
 * @returns {string[]} Array of matching availability slot names
 */
function mapTimeToSlots(preferredTime) {
  if (!preferredTime || preferredTime.trim() === "") {
    return []; // No time filter — accept all
  }

  const lower = preferredTime.toLowerCase();
  const slots = [];

  // Map common time expressions to slot names
  const timeSlotMap = {
    morning: ["morning"],
    subah: ["morning"],
    afternoon: ["afternoon"],
    dopahar: ["afternoon"],
    evening: ["evening"],
    shaam: ["evening"],
    night: ["night"],
    raat: ["night"],
    abhi: ["morning", "afternoon", "evening", "night"],
    urgent: ["morning", "afternoon", "evening", "night"],
    asap: ["morning", "afternoon", "evening", "night"],
    now: ["morning", "afternoon", "evening", "night"],
    foran: ["morning", "afternoon", "evening", "night"],
    kal: ["morning", "afternoon", "evening"],
    tomorrow: ["morning", "afternoon", "evening"],
    aaj: ["morning", "afternoon", "evening", "night"],
    today: ["morning", "afternoon", "evening", "night"],
  };

  for (const [key, value] of Object.entries(timeSlotMap)) {
    if (lower.includes(key)) {
      value.forEach((s) => {
        if (!slots.includes(s)) slots.push(s);
      });
    }
  }

  return slots;
}

/**
 * Discovers and filters service providers based on extracted intent.
 *
 * @param {object} intent - Structured intent from intentAgent
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {object[]} Top 10 nearby, available providers with distance info
 */
export function discoverProviders(intent, userLat, userLng) {
  console.log("[ANTIGRAVITY][DISCOVERY_AGENT] ─────────────────────────────────");
  console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Starting discovery...");
  console.log(
    `[ANTIGRAVITY][DISCOVERY_AGENT] Filtering ${providersData.length} providers`
  );

  try {
    // Step 1: Filter by service_type
    const serviceType = (intent.service_type || "").toLowerCase();
    let filtered = providersData.filter(
      (p) => p.service_type.toLowerCase() === serviceType
    );

    console.log(
      `[ANTIGRAVITY][DISCOVERY_AGENT] Matched: ${filtered.length} ${serviceType}s`
    );

    if (filtered.length === 0) {
      console.log(
        "[ANTIGRAVITY][DISCOVERY_AGENT] No providers found for service type:",
        serviceType
      );
      console.log("[ANTIGRAVITY][DISCOVERY_AGENT] ─────────────────────────────────");
      return [];
    }

    // Step 2: Calculate distance for each provider
    filtered = filtered.map((provider) => {
      const distance = getDistanceKm(userLat, userLng, provider.lat, provider.lng);
      return {
        ...provider,
        distanceKm: Math.round(distance * 100) / 100,
      };
    });

    console.log(
      "[ANTIGRAVITY][DISCOVERY_AGENT] Distances calculated for all providers"
    );

    // Step 3: Filter by availability if time preference exists
    const timeSlots = mapTimeToSlots(intent.preferred_time);

    if (timeSlots.length > 0) {
      const beforeCount = filtered.length;
      filtered = filtered.filter((p) =>
        timeSlots.some((slot) => p.availability.includes(slot))
      );
      console.log(
        `[ANTIGRAVITY][DISCOVERY_AGENT] After time filter (${timeSlots.join(
          ", "
        )}): ${filtered.length} of ${beforeCount}`
      );
    } else {
      console.log(
        "[ANTIGRAVITY][DISCOVERY_AGENT] No time filter applied — all times accepted"
      );
    }

    // Step 4: Sort by distance (nearest first)
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    // Step 5: Take top 10
    const top10 = filtered.slice(0, 10);

    console.log(
      `[ANTIGRAVITY][DISCOVERY_AGENT] After distance sort: top ${top10.length} providers`
    );

    top10.forEach((p, i) => {
      console.log(
        `[ANTIGRAVITY][DISCOVERY_AGENT]   ${i + 1}. ${p.name} — ${p.distanceKm}km — ${p.area}`
      );
    });

    console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Discovery complete");
    console.log("[ANTIGRAVITY][DISCOVERY_AGENT] ─────────────────────────────────");

    return top10;
  } catch (error) {
    console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Error:", error.message);
    console.log("[ANTIGRAVITY][DISCOVERY_AGENT] ─────────────────────────────────");
    return [];
  }
}
