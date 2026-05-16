// ═══════════════════════════════════════════════════════
// Karigar AI — Intent Extraction Agent
// ═══════════════════════════════════════════════════════
// Uses Google Gemini API to extract structured intent
// from user input in Urdu, Roman Urdu, English, or mixed.
// ═══════════════════════════════════════════════════════

import axios from "axios";

const GEMINI_API_KEY = "AIzaSyCS8dF7TBB_OM4vUJI_eAGUdf4Cq123tWA";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an intent extraction agent for Karigar AI, a Pakistani home service booking platform. The user may write in Urdu, Roman Urdu, English, or a mix.

Extract these fields:
- service_type: electrician / plumber / AC technician / tutor / beautician
- location: area or address mentioned
- preferred_time: when they want service
- budget_sensitivity: low/medium/high
- urgency: low/medium/high (high = words like bilkul kaam nahi, emergency, abhi, urgent)
- job_complexity: basic/intermediate/complex
- confidence_score: 0.0 to 1.0
- clarification_needed: true/false
- clarification_question: if confidence below 0.75, ask one short question in the same language the user used

Return ONLY valid JSON. No extra text. No markdown. No explanation.

{
  "service_type": "",
  "location": "",
  "preferred_time": "",
  "budget_sensitivity": "",
  "urgency": "",
  "job_complexity": "",
  "confidence_score": 0.0,
  "clarification_needed": false,
  "clarification_question": ""
}`;

/**
 * Default fallback intent returned when Gemini fails or returns invalid data.
 */
const FALLBACK_INTENT = {
  service_type: "unknown",
  location: "",
  preferred_time: "",
  budget_sensitivity: "medium",
  urgency: "medium",
  job_complexity: "basic",
  confidence_score: 0.0,
  clarification_needed: true,
  clarification_question:
    "Maaf kijiye, aapki request samajh nahi aayi. Kya aap bata sakte hain kaunsi service chahiye?",
};

/**
 * Safely parses JSON from Gemini response, stripping markdown fences if present.
 * @param {string} text - Raw text from Gemini
 * @returns {object|null} Parsed JSON or null
 */
function safeParseJSON(text) {
  try {
    // Strip markdown code fences if Gemini wraps response
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log("[ANTIGRAVITY][INTENT_AGENT] JSON parse failed:", error.message);
    return null;
  }
}

/**
 * Validates that the parsed intent has all required fields.
 * Fills in missing fields with defaults.
 * @param {object} intent - Parsed intent object
 * @returns {object} Validated intent
 */
function validateIntent(intent) {
  const defaults = {
    service_type: "unknown",
    location: "",
    preferred_time: "",
    budget_sensitivity: "medium",
    urgency: "medium",
    job_complexity: "basic",
    confidence_score: 0.0,
    clarification_needed: false,
    clarification_question: "",
  };

  const validated = { ...defaults, ...intent };

  // Ensure confidence_score is a number
  validated.confidence_score = parseFloat(validated.confidence_score) || 0.0;

  // Normalize service_type to lowercase
  validated.service_type = (validated.service_type || "unknown").toLowerCase();

  // Auto-flag clarification if confidence is low
  if (validated.confidence_score < 0.75 && !validated.clarification_needed) {
    validated.clarification_needed = true;
    if (!validated.clarification_question) {
      validated.clarification_question =
        "Kya aap thodi aur detail de sakte hain apni zaroorat ke baare mein?";
    }
  }

  return validated;
}

/**
 * Extracts structured intent from raw user text using Google Gemini API.
 *
 * @param {string} userInput - Raw text input from the user
 * @returns {Promise<object>} Structured intent object
 */
export async function extractIntent(userInput) {
  console.log("[ANTIGRAVITY][INTENT_AGENT] ─────────────────────────────────");
  console.log("[ANTIGRAVITY][INTENT_AGENT] Input received:", userInput);

  if (!userInput || userInput.trim() === "") {
    console.log("[ANTIGRAVITY][INTENT_AGENT] Empty input — returning fallback");
    return { ...FALLBACK_INTENT };
  }

  try {
    console.log("[ANTIGRAVITY][INTENT_AGENT] Calling Gemini API...");

    const requestBody = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `User input: "${userInput}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 500,
      },
    };

    const response = await axios.post(GEMINI_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    // Extract text from Gemini response
    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("[ANTIGRAVITY][INTENT_AGENT] Raw Gemini response received");

    if (!rawText) {
      console.log("[ANTIGRAVITY][INTENT_AGENT] Empty response — using fallback");
      return { ...FALLBACK_INTENT };
    }

    // Parse and validate
    const parsed = safeParseJSON(rawText);

    if (!parsed) {
      console.log("[ANTIGRAVITY][INTENT_AGENT] Parse failed — using fallback");
      return { ...FALLBACK_INTENT };
    }

    const intent = validateIntent(parsed);

    console.log(
      "[ANTIGRAVITY][INTENT_AGENT] Confidence:",
      intent.confidence_score
    );
    console.log(
      "[ANTIGRAVITY][INTENT_AGENT] Service:",
      intent.service_type
    );
    console.log(
      "[ANTIGRAVITY][INTENT_AGENT] Clarification needed:",
      intent.clarification_needed
    );
    console.log("[ANTIGRAVITY][INTENT_AGENT] Output:", JSON.stringify(intent));
    console.log("[ANTIGRAVITY][INTENT_AGENT] ─────────────────────────────────");

    return intent;
  } catch (error) {
    console.log("[ANTIGRAVITY][INTENT_AGENT] API Error:", error.message);

    if (error.response) {
      console.log(
        "[ANTIGRAVITY][INTENT_AGENT] Status:",
        error.response.status
      );
      console.log(
        "[ANTIGRAVITY][INTENT_AGENT] Data:",
        JSON.stringify(error.response.data)
      );
    }

    console.log("[ANTIGRAVITY][INTENT_AGENT] Returning fallback intent");
    return { ...FALLBACK_INTENT };
  }
}
