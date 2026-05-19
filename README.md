# Karigar AI

**One line description:**
AI-powered home service booking platform for Pakistan that connects users with verified local Karigars (electricians, plumbers, AC technicians, tutors, beauticians) through natural language requests in Urdu, Roman Urdu, or English.

**Primary goal:**
Allow any Pakistani user to type their home service need in any language and get a verified Karigar booked in under 60 seconds through an AI agent pipeline.

---

## Target User

**Who is the main user:**
Pakistani homeowners aged 22-45 in major cities (Karachi, Lahore, Islamabad) who need reliable home services but currently rely on WhatsApp groups, phone calls, and informal referrals to find workers.

**What problem are they coming to solve:**
They need a trustworthy, fast way to find and book a skilled home service worker without getting overcharged, ghosted, or matched with unreliable providers.

**What does success look like for them:**
User types their problem in Urdu, sees the best matched Karigar with transparent pricing, confirms booking in one tap, and gets the Karigar at their door at the confirmed time.

---

## Pages and Structure

*   **Landing Page**: Instantly communicate what Karigar AI does, build trust, and drive users to the booking flow. Features a live AI demo and horizontal scroll top Karigar gallery.
*   **Home / Search Screen**: Main AI search interface where user types their request and the intent agent extracts structured data. Includes clarification logic for low confidence queries.
*   **Results Screen**: Show ranked providers with AI reasoning. Includes an Antigravity Reasoning Trace console with color-coded logs.
*   **Provider Profile Screen**: Full Karigar profile with stats, about section, availability slots, and customer reviews.
*   **Booking Screen**: Collect user details, confirm time slot, show price breakdown, confirm booking.
*   **Tracking Screen**: Show live booking status on a 5-step timeline with pulsing animation and allow feedback submission.
*   **Dispute Screen**: Allow users to report issues and request resolution.

---

## Features — Must Have

1.  **Multilingual Intent Agent**: Gemini 2.0 Flash parses Urdu, Roman Urdu, and English into structured JSON.
2.  **6-Factor Provider Matching Engine**: Scores providers on distance, rating, reliability, price, specialization, and risk.
3.  **Dynamic Pricing Engine**: Calculates quote from visit fee + distance + service + complexity + urgency adjustment + budget discount.
4.  **Booking Simulation**: Generates booking ID, saves to Firebase, shows confirmation alert.
5.  **Antigravity Reasoning Trace**: Collapsible console showing color-coded agent logs.
6.  **Live Status Tracking Timeline**: 5-step vertical timeline with pulsing active step.
7.  **Feedback and Dispute System**: Star rating submission + dispute form with ticket ID generation.

---

## Design Requirements

*   **Overall feel**: Premium dark-mode tech product. Cinematic and modern.
*   **Color palette**:
    *   Background: `#0D1B2A` (dark navy)
    *   Card: `#1A2F45` (medium navy)
    *   Primary: `#02C39A` (mint green)
    *   Teal: `#028090` (teal)
    *   Warning: `#F9C74F` (yellow)
    *   Danger: `#E63946` (red)
    *   White: `#FFFFFF`
    *   Body text: `#8FB3C5` (light blue-grey)
    *   Border: `#1E3A5F`
    *   Dark: `#0A1520`

---

## Technical Requirements

*   **Platform**: React Native (Expo) for mobile app. React + Vite for web landing page.
*   **Database**: Firebase Realtime Database.
*   **Integrations**: Google Gemini 2.0 Flash API, Firebase.

---

## Agent Pipeline Architecture

*   `agents/intentAgent.js`: Parses user text to structured intent JSON.
*   `agents/discoveryAgent.js`: Finds top nearby providers based on intent and location.
*   `agents/matchingAgent.js`: Scores and ranks providers using a 6-factor weighted engine.
*   `agents/pricingAgent.js`: Calculates a dynamic quote breakdown.
*   `agents/bookingAgent.js`: Creates the booking object and simulates saving.
*   `agents/followupAgent.js`: Handles feedback, disputes, and cancellations.
