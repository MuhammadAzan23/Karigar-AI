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
      return "#EF4444"; // Red
    case "medium":
      return "#F59E0B"; // Amber
    case "low":
      return "#10B981"; // Green (success)
    default:
      return "#475569"; // Muted label grey
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
    "karachi": { lat: 24.8607, lng: 67.0011 },
  };

  const key = (area || "karachi").toLowerCase().trim();
  
  // Fuzzy search for coordinates
  for (const [name, coords] of Object.entries(areaCoords)) {
    if (key.includes(name)) {
      return coords;
    }
  }

  return areaCoords["karachi"];
}

/**
 * Debounce function to prevent multiple rapid calls
 * Useful for form submissions, searches, API calls
 */
export function debounce(func, wait = 500) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls
 * Useful for scroll events, window resize, etc.
 */
export function throttle(func, limit = 500) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create an async operation guard to prevent race conditions
 * Prevents duplicate API calls when button is mashed
 */
export function createAsyncGuard() {
  let isProcessing = false;

  const guard = async (asyncFn) => {
    if (isProcessing) {
      console.log('[ASYNC_GUARD] Operation already in progress');
      return null;
    }

    isProcessing = true;
    try {
      const result = await asyncFn();
      return result;
    } finally {
      isProcessing = false;
    }
  };

  const isGuarded = () => isProcessing;
  return { guard, isGuarded };
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Pakistani phone number
 * Accepts: 03001234567, +923001234567, 03XX-XXXXXXX
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  const phoneRegex = /^(\+92|0)?3\d{2}\d{7}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log('[SAFE_JSON_PARSE] Failed to parse JSON:', error.message);
    return fallback;
  }
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff(
  asyncFn,
  maxRetries = 3,
  initialDelayMs = 1000
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(
          `[RETRY] Attempt ${attempt + 1} failed. Retrying in ${delayMs}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Format price with PKR currency
 */
export function formatPrice(price) {
  if (typeof price !== 'number' || price < 0) {
    return 'PKR 0';
  }
  return `PKR ${price.toLocaleString('en-PK')}`;
}
