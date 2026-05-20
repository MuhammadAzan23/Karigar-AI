// ═══════════════════════════════════════════════════════
// Karigar AI — Booking Agent
// ═══════════════════════════════════════════════════════
// Handles the formal creation of bookings, saves to
// Firebase Realtime Database, and emulates SMS alerts.
// Logs: [ANTIGRAVITY][BOOKING_AGENT]
// ═══════════════════════════════════════════════════════

import { ref, set } from "firebase/database";
import { db } from "../config/firebase";

export async function createBooking(provider, intent, quote, userInfo) {
  console.log("[ANTIGRAVITY][BOOKING_AGENT] Initiating booking creation...");

  try {
    const bookingDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `KAI-${bookingDigits}`;

    const bookingObject = {
      id: bookingId,
      provider: {
        id: provider.id,
        name: provider.name,
        service_type: provider.service_type,
        rating: provider.rating,
        phone: provider.phone || "+92 300 9876543",
        avatar_bg: provider.avatar_bg || "#028090",
        initials: provider.initials || "KAI",
      },
      intent: {
        service_type: intent.service_type,
        location: intent.location || userInfo.address || "Karachi",
        job_complexity: intent.job_complexity || "basic",
        urgency: intent.urgency || "medium",
      },
      quote: {
        total: quote.total,
        visitFee: quote.visitFee,
        serviceFee: quote.serviceFee,
        distanceFee: quote.distanceFee,
        discount: quote.discount,
        urgencyFee: quote.urgencyFee,
        surgeFee: quote.surgeFee,
      },
      customer: {
        name: userInfo.name || "Azan",
        phone: userInfo.phone || "+92 300 1234567",
        address: userInfo.address || "Main Boulevard, Karachi",
        timeSlot: userInfo.timeSlot || "Flexible",
      },
      status: "confirmed",
      currentStep: 0, // 0 = Confirmed, 1 = Notified, 2 = En Route, 3 = In Progress, 4 = Completed
      createdAt: Date.now(),
    };

    console.log(`[ANTIGRAVITY][BOOKING_AGENT] Saving booking ${bookingId} to Firebase...`);
    const bookingRef = ref(db, `bookings/${bookingId}`);
    await set(bookingRef, bookingObject);
    console.log("[ANTIGRAVITY][BOOKING_AGENT] Firebase write completed successfully.");

    // Emulate SMS alerts
    simulateSMS(bookingObject);

    return bookingObject;
  } catch (error) {
    console.log("[ANTIGRAVITY][BOOKING_AGENT] Firebase save failed, returning local fallback object:", error.message);
    
    // Return mock booking object in case of offline/network failure
    const mockId = `KAI-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockObj = {
      id: mockId,
      provider,
      intent,
      quote,
      customer: {
        name: userInfo.name || "Azan",
        phone: userInfo.phone || "+92 300 1234567",
        address: userInfo.address || "Karachi",
        timeSlot: userInfo.timeSlot || "Flexible",
      },
      status: "confirmed",
      currentStep: 0,
      createdAt: Date.now(),
    };
    simulateSMS(mockObj);
    return mockObj;
  }
}

function simulateSMS(booking) {
  const customerSMS = `[ANTIGRAVITY][SMS_SIMULATION] SMS to Customer (${booking.customer.phone}): Assalam-o-Alaikum ${booking.customer.name}, apka booking request #${booking.id} confirm ho gaya hai! Karigar ${booking.provider.name} (~${booking.provider.rating}★) jald hi aapke bataye huay pata (${booking.customer.address}) par pohnch jayenge. Shukriya!`;
  const providerSMS = `[ANTIGRAVITY][SMS_SIMULATION] SMS to Karigar (${booking.provider.phone}): Assalam-o-Alaikum ${booking.provider.name}, aapke paas aik naya order aya hai. Customer: ${booking.customer.name}, Phone: ${booking.customer.phone}, Address: ${booking.customer.address}, Kaam: ${booking.intent.service_type} (${booking.intent.job_complexity}). Pohnchne ka time slot: ${booking.customer.timeSlot}. Best of luck!`;

  console.log("═══════════════════════════════════════════════════════");
  console.log(customerSMS);
  console.log("-------------------------------------------------------");
  console.log(providerSMS);
  console.log("═══════════════════════════════════════════════════════");
}
