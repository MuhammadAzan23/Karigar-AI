// ═══════════════════════════════════════════════════════
// Karigar AI — Discovery Agent
// ═══════════════════════════════════════════════════════
// Filters and discovers nearby service providers based
// on intent, distance, and availability.
// Logs: [ANTIGRAVITY][DISCOVERY_AGENT]
// ═══════════════════════════════════════════════════════

import providersData from "../data/providers.json";

/**
 * Calculates distance between coordinates in km using Haversine formula.
 */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
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
 * Maps preferred time from Roman Urdu/English to availability slots.
 */
function mapTimeToSlots(preferredTime) {
  if (!preferredTime || preferredTime.trim() === "") {
    return [];
  }

  const lower = preferredTime.toLowerCase().trim();
  const slots = [];

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
 * Discovers available providers matching the intent.
 */
export function discoverProviders(intent, userLat, userLng) {
  console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Starting discovery...");
  console.log(`[ANTIGRAVITY][DISCOVERY_AGENT] Total database size: ${providersData.length}`);

  try {
    const serviceType = (intent.service_type || "").toLowerCase();
    
    // Step 1: Service type filtering
    let filtered = providersData.filter(
      (p) => p.service_type.toLowerCase() === serviceType
    );
    console.log(`[ANTIGRAVITY][DISCOVERY_AGENT] Matches for "${serviceType}": ${filtered.length}`);

    // If zero found (or unknown type), fallback to all providers to avoid blank states
    if (filtered.length === 0) {
      console.log("[ANTIGRAVITY][DISCOVERY_AGENT] No exact match, offering fallbacks...");
      filtered = [...providersData];
    }

    // Step 2: Distance calculation
    filtered = filtered.map((provider) => {
      const distance = getDistanceKm(userLat, userLng, provider.lat, provider.lng);
      return {
        ...provider,
        distanceKm: Math.round(distance * 10) / 10,
      };
    });

    // Step 3: Availability slot filtering
    const timeSlots = mapTimeToSlots(intent.preferred_time);
    if (timeSlots.length > 0) {
      const preFilterLength = filtered.length;
      const matchedAvailability = filtered.filter((p) =>
        timeSlots.some((slot) => p.availability.includes(slot))
      );
      
      // If filtering leaves us with nothing, ignore time filter so we don't return 0
      if (matchedAvailability.length > 0) {
        filtered = matchedAvailability;
        console.log(`[ANTIGRAVITY][DISCOVERY_AGENT] Slot filter applied. Remaining: ${filtered.length} of ${preFilterLength}`);
      } else {
        console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Time filter yielded 0. Ignoring slot constraints to prevent empty lists.");
      }
    }

    // Step 4: Sort by distance (nearest first)
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    // Step 5: Slice top 10
    const top10 = filtered.slice(0, 10);
    console.log(`[ANTIGRAVITY][DISCOVERY_AGENT] Discovery successful. Found ${top10.length} nearby providers.`);
    return top10;
  } catch (error) {
    console.log("[ANTIGRAVITY][DISCOVERY_AGENT] Error in discovery:", error.message);
    return providersData.slice(0, 10).map(p => ({ ...p, distanceKm: 2.5 }));
  }
}
