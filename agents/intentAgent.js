// ═══════════════════════════════════════════════════════
// Karigar AI — Intent Extraction Agent
// ═══════════════════════════════════════════════════════
// Uses Google Gemini 2.0 Flash to extract structured intent
// from user input in Urdu, Roman Urdu, English, or mixed.
// Logs: [ANTIGRAVITY][INTENT_AGENT]
// ═══════════════════════════════════════════════════════

import axios from "axios";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "REPLACE_YOUR_GEMINI_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an intent extraction agent for Karigar AI, a premium Pakistani home service booking platform. The user may write in Urdu, Roman Urdu, English, or a mix.

Extract the following fields from the user input:
- service_type: Must be exactly one of: "electrician", "plumber", "AC technician", "tutor", "beautician", or "unknown"
- location: The specific area or address mentioned (e.g. Gulshan, DHA, Clifton, North Nazimabad, F.B Area, Nazimabad, Saddar, Korangi, Malir)
- preferred_time: When they want the service (e.g. morning, afternoon, evening, night, abhi, urgent, kal, tomorrow)
- budget_sensitivity: "low" (high/premium budget), "medium" (flexible/moderate), "high" (extremely budget conscious / cheap)
- urgency: "low" (not urgent), "medium" (general booking), "high" (ASAP, urgent, emergency, abhi, foran)
- job_complexity: "basic" (simple task like fixing a light bulb, checking a tap), "intermediate" (installing a geyser, medium repair), "complex" (complete house wiring, main pipeline leakage, MDCAT tutoring, bridal makeup)
- confidence_score: Numeric score from 0.0 to 1.0 indicating how confident you are in this extraction
- clarification_needed: boolean, set to true if confidence_score is below 0.75 or if the user's intent is highly ambiguous
- clarification_question: If clarification_needed is true, write a single short, natural question in Roman Urdu (or in the user's input style) asking the user to clarify what they need. E.g. "Kya aap AC ka cooling issue check karwana chahte hain ya service?"

Rules:
1. Return ONLY a valid JSON object. Do NOT wrap in markdown code blocks. No extra text, no notes, no markdown.
2. If service_type is not one of the five (electrician, plumber, AC technician, tutor, beautician), set it to "unknown" and flag clarification_needed as true.
3. Be realistic with the confidence_score. If they just say "hi" or "hello", set confidence_score to 0.1, service_type to "unknown", clarification_needed to true, and ask a warm Roman Urdu prompt question.

JSON Template:
{
  "service_type": "electrician | plumber | AC technician | tutor | beautician | unknown",
  "location": "",
  "preferred_time": "",
  "budget_sensitivity": "low | medium | high",
  "urgency": "low | medium | high",
  "job_complexity": "basic | intermediate | complex",
  "confidence_score": 0.0,
  "clarification_needed": false,
  "clarification_question": ""
}`;

const FALLBACK_INTENT = {
  service_type: "unknown",
  location: "",
  preferred_time: "",
  budget_sensitivity: "medium",
  urgency: "medium",
  job_complexity: "basic",
  confidence_score: 0.0,
  clarification_needed: true,
  clarification_question: "Maaf kijiye, mujhe sahi samajh nahi aaya. Kya aap apni zaroorat thora wazeh karke bata sakte hain?",
};

function safeParseJSON(text) {
  try {
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
  validated.confidence_score = parseFloat(validated.confidence_score) || 0.0;
  validated.service_type = (validated.service_type || "unknown").toLowerCase();

  const validTypes = ["electrician", "plumber", "AC technician", "tutor", "beautician"];
  if (!validTypes.includes(validated.service_type)) {
    validated.service_type = "unknown";
  }

  if (validated.confidence_score < 0.75 || validated.service_type === "unknown") {
    validated.clarification_needed = true;
    if (!validated.clarification_question) {
      validated.clarification_question = "Aapko kaunsi service chahiye? (Electrician, Plumber, AC Repair, Tutor, ya Beautician?)";
    }
  }

  return validated;
}

export async function extractIntent(userInput) {
  console.log("[ANTIGRAVITY][INTENT_AGENT] Input received:", userInput);

  if (!userInput || userInput.trim() === "") {
    console.log("[ANTIGRAVITY][INTENT_AGENT] Empty input, returning fallback");
    return { ...FALLBACK_INTENT };
  }

  if (GEMINI_API_KEY === "REPLACE_YOUR_GEMINI_KEY") {
    console.log("[ANTIGRAVITY][INTENT_AGENT] API key is missing/placeholder. Emulating locally...");
    // Local emulation for testing without key
    return emulateLocalIntent(userInput);
  }

  try {
    const requestBody = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `User Input: "${userInput}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 400,
      },
    };

    const response = await axios.post(GEMINI_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("[ANTIGRAVITY][INTENT_AGENT] Gemini Raw response received");

    if (!rawText) {
      console.log("[ANTIGRAVITY][INTENT_AGENT] Empty response, returning fallback");
      return { ...FALLBACK_INTENT };
    }

    const parsed = safeParseJSON(rawText);
    if (!parsed) {
      console.log("[ANTIGRAVITY][INTENT_AGENT] JSON parse error, returning fallback");
      return { ...FALLBACK_INTENT };
    }

    const validated = validateIntent(parsed);
    console.log("[ANTIGRAVITY][INTENT_AGENT] Extraction successful. Confidence:", validated.confidence_score);
    return validated;
  } catch (error) {
    console.log("[ANTIGRAVITY][INTENT_AGENT] API error:", error.message);
    // Emulate if network fails so the app continues working beautifully
    return emulateLocalIntent(userInput);
  }
}

// Local rule-based parser as a highly robust fallback so the app NEVER crashes
function emulateLocalIntent(userInput) {
  const lower = userInput.toLowerCase();
  const intent = {
    service_type: "unknown",
    location: "",
    preferred_time: "",
    budget_sensitivity: "medium",
    urgency: "medium",
    job_complexity: "basic",
    confidence_score: 0.85,
    clarification_needed: false,
    clarification_question: "",
  };

  // 1. Service Type Detection
  if (lower.includes("ac") || lower.includes("cooling") || lower.includes("fridge") || lower.includes("chiller")) {
    intent.service_type = "AC technician";
  } else if (lower.includes("electric") || lower.includes("bijli") || lower.includes("fan") || lower.includes("switch") || lower.includes("light") || lower.includes("wire") || lower.includes("ups")) {
    intent.service_type = "electrician";
  } else if (lower.includes("plumb") || lower.includes("pipe") || lower.includes("leak") || lower.includes("nalka") || lower.includes("flush") || lower.includes("water") || lower.includes("tap") || lower.includes("geyser")) {
    intent.service_type = "plumber";
  } else if (lower.includes("tutor") || lower.includes("teacher") || lower.includes("parhai") || lower.includes("math") || lower.includes("study") || lower.includes("class") || lower.includes("padha")) {
    intent.service_type = "tutor";
  } else if (lower.includes("beauty") || lower.includes("salon") || lower.includes("facial") || lower.includes("parlor") || lower.includes("makeup") || lower.includes("bridal") || lower.includes("threading") || lower.includes("wax")) {
    intent.service_type = "beautician";
  }

  // 2. Location Detection
  const locations = ["gulshan", "dha", "clifton", "nazimabad", "saddar", "korangi", "malir"];
  for (const loc of locations) {
    if (lower.includes(loc)) {
      intent.location = loc.charAt(0).toUpperCase() + loc.slice(1);
    }
  }

  // 3. Preferred Time Detection
  if (lower.includes("abhi") || lower.includes("foran") || lower.includes("urgent") || lower.includes("asap") || lower.includes("now")) {
    intent.preferred_time = "abhi";
    intent.urgency = "high";
  } else if (lower.includes("subah") || lower.includes("morning")) {
    intent.preferred_time = "subah";
  } else if (lower.includes("dopahar") || lower.includes("afternoon")) {
    intent.preferred_time = "dopahar";
  } else if (lower.includes("shaam") || lower.includes("evening")) {
    intent.preferred_time = "shaam";
  } else if (lower.includes("raat") || lower.includes("night")) {
    intent.preferred_time = "raat";
  } else if (lower.includes("kal") || lower.includes("tomorrow")) {
    intent.preferred_time = "kal";
  }

  // 4. Complexity & Budget
  if (lower.includes("heavy") || lower.includes("complicat") || lower.includes("bridal") || lower.includes("complete") || lower.includes("mains")) {
    intent.job_complexity = "complex";
  } else if (lower.includes("install") || lower.includes("repair") || lower.includes("fix")) {
    intent.job_complexity = "intermediate";
  }

  if (lower.includes("sasta") || lower.includes("cheap") || lower.includes("budget") || lower.includes("kam paise")) {
    intent.budget_sensitivity = "high";
  } else if (lower.includes("premium") || lower.includes("best quality") || lower.includes("vip")) {
    intent.budget_sensitivity = "low";
  }

  // If service is still unknown, request clarification
  if (intent.service_type === "unknown") {
    intent.confidence_score = 0.3;
    intent.clarification_needed = true;
    intent.clarification_question = "Aapko kis qism ki service chahiye? Please batayein taake mein behtareen match dhoond sakoon.";
  }

  return intent;
}
