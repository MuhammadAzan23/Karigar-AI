// ═══════════════════════════════════════════════════════
// Karigar AI — Utility Helper Functions
// ═══════════════════════════════════════════════════════

/**
 * Converts preferred_time string into a human-readable format.
 * Handles common Urdu/Roman Urdu time expressions.
 * @param {string} preferredTime - Raw time string from intent extraction
 * @returns {string} Human-readable time string
 */
export function formatTime(preferredTime) {
  if (!preferredTime || preferredTime.trim() === "") {
    return "Flexible / Anytime";
  }

  const lower = preferredTime.toLowerCase().trim();

  // Roman Urdu mappings
  const timeMap = {
    "abhi": "Right Now — ASAP",
    "ab": "Right Now — ASAP",
    "foran": "Right Now — ASAP",
    "urgent": "Right Now — ASAP",
    "subah": "Morning (8 AM – 12 PM)",
    "kal subah": "Tomorrow Morning (8 AM – 12 PM)",
    "dopahar": "Afternoon (12 PM – 4 PM)",
    "kal dopahar": "Tomorrow Afternoon (12 PM – 4 PM)",
    "shaam": "Evening (4 PM – 8 PM)",
    "kal shaam": "Tomorrow Evening (4 PM – 8 PM)",
    "raat": "Night (8 PM – 11 PM)",
    "kal raat": "Tomorrow Night (8 PM – 11 PM)",
    "kal": "Tomorrow",
    "parso": "Day After Tomorrow",
    "aaj": "Today",
    "morning": "Morning (8 AM – 12 PM)",
    "afternoon": "Afternoon (12 PM – 4 PM)",
    "evening": "Evening (4 PM – 8 PM)",
    "night": "Night (8 PM – 11 PM)",
    "tomorrow": "Tomorrow",
    "tomorrow morning": "Tomorrow Morning (8 AM – 12 PM)",
    "tomorrow evening": "Tomorrow Evening (4 PM – 8 PM)",
    "today": "Today",
    "asap": "Right Now — ASAP",
    "now": "Right Now — ASAP",
  };

  // Check for exact matches first
  if (timeMap[lower]) {
    return timeMap[lower];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(timeMap)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  // Return as-is if no mapping found
  return preferredTime;
}

/**
 * Returns a hex color code based on urgency level.
 * @param {string} urgency - "low" | "medium" | "high"
 * @returns {string} Hex color code
 */
export function getUrgencyColor(urgency) {
  switch ((urgency || "").toLowerCase()) {
    case "high":
      return "#FF4D4D"; // Red
    case "medium":
      return "#FFD93D"; // Yellow
    case "low":
      return "#02C39A"; // Green (mint)
    default:
      return "#AAAAAA"; // Grey for unknown
  }
}

/**
 * Returns a human-readable budget label.
 * @param {string} budgetSensitivity - "low" | "medium" | "high"
 * @returns {string} Budget label
 */
export function getBudgetLabel(budgetSensitivity) {
  switch ((budgetSensitivity || "").toLowerCase()) {
    case "high":
      return "💰 Budget-Friendly";
    case "medium":
      return "💳 Flexible";
    case "low":
      return "💎 Premium";
    default:
      return "💳 Flexible";
  }
}

/**
 * Returns a complexity badge string with emoji.
 * @param {string} jobComplexity - "basic" | "intermediate" | "complex"
 * @returns {string} Complexity badge
 */
export function getComplexityBadge(jobComplexity) {
  switch ((jobComplexity || "").toLowerCase()) {
    case "basic":
      return "🟢 Basic";
    case "intermediate":
      return "🟡 Intermediate";
    case "complex":
      return "🔴 Complex";
    default:
      return "🟢 Basic";
  }
}

/**
 * Generates star rating display string.
 * @param {number} rating - Rating value 0-5
 * @returns {string} Star display string
 */
export function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

/**
 * Formats distance in km to a readable string.
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Maps area name to approximate coordinates in Karachi.
 * Used when user provides an area name instead of coordinates.
 * @param {string} area - Area name in Karachi
 * @returns {{ lat: number, lng: number }} Coordinates
 */
export function getAreaCoordinates(area) {
  const areaCoords = {
    "gulshan": { lat: 24.9262, lng: 67.0935 },
    "gulshan-e-iqbal": { lat: 24.9262, lng: 67.0935 },
    "dha": { lat: 24.8071, lng: 67.0597 },
    "defence": { lat: 24.8071, lng: 67.0597 },
    "clifton": { lat: 24.8138, lng: 67.0300 },
    "north nazimabad": { lat: 24.9424, lng: 67.0340 },
    "nazimabad": { lat: 24.9124, lng: 67.0340 },
    "f.b area": { lat: 24.9200, lng: 67.0600 },
    "fb area": { lat: 24.9200, lng: 67.0600 },
    "federal b area": { lat: 24.9200, lng: 67.0600 },
    "saddar": { lat: 24.8556, lng: 67.0280 },
    "korangi": { lat: 24.8300, lng: 67.1300 },
    "malir": { lat: 24.8900, lng: 67.2000 },
    "bahria town": { lat: 24.9600, lng: 67.3200 },
    "bahria": { lat: 24.9600, lng: 67.3200 },
    "g-13": { lat: 24.9262, lng: 67.0935 },
    "karachi": { lat: 24.8607, lng: 67.0011 },
  };

  const key = (area || "karachi").toLowerCase().trim();
  return areaCoords[key] || areaCoords["karachi"];
}
