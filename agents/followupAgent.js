// ═══════════════════════════════════════════════════════
// Karigar AI — Follow-up Agent
// ═══════════════════════════════════════════════════════
// Processes post-booking operations: updates, cancellations,
// customer ratings feedback, and dispute reports in Firebase.
// Logs: [ANTIGRAVITY][FOLLOWUP_AGENT]
// ═══════════════════════════════════════════════════════

import { ref, update, set } from "firebase/database";
import { db } from "../config/firebase";

export async function processFollowup(bookingId, type, data) {
  console.log(`[ANTIGRAVITY][FOLLOWUP_AGENT] Processing follow-up for #${bookingId}. Type: ${type}`);

  try {
    const bookingRef = ref(db, `bookings/${bookingId}`);
    let result = { success: true, message: "", error: null };

    switch (type) {
      case "feedback": {
        const { rating, comment } = data;
        if (!rating || rating < 1 || rating > 5) {
          return { 
            success: false, 
            message: "Invalid rating. Must be between 1-5.",
            error: "INVALID_RATING"
          };
        }

        const updates = {
          feedback: {
            rating: rating || 5,
            comment: comment || "",
            submittedAt: Date.now(),
          },
          currentStep: 4, // Finalized completed state
          status: "completed",
        };
        await update(bookingRef, updates);
        console.log(`[ANTIGRAVITY][FOLLOWUP_AGENT] Rating feedback saved: ${rating}★`);
        result.message = "Shukriya! Aapka feedback record kar liya gaya hai.";
        break;
      }

      case "dispute": {
        const { disputeType, description, resolution } = data;
        if (!disputeType || !description) {
          return {
            success: false,
            message: "Dispute type and description are required.",
            error: "MISSING_DISPUTE_INFO"
          };
        }

        const disputeObject = {
          bookingId,
          disputeType,
          description,
          resolution,
          submittedAt: Date.now(),
          status: "pending_review",
        };
        const disputeRef = ref(db, `disputes/${bookingId}`);
        await set(disputeRef, disputeObject);
        await update(bookingRef, { status: "disputed" });
        console.log(`[ANTIGRAVITY][FOLLOWUP_AGENT] Dispute filed. Type: ${disputeType}`);
        result.message = "Shukriya! Aapki shikayat register ho chuki hai. Hum 24 ghante mein aapse rabta karenge.";
        break;
      }

      case "cancel": {
        // Validate cancellation policy
        const bookingSnapshot = await db.ref(`bookings/${bookingId}`).once('value');
        const booking = bookingSnapshot.val();
        
        if (!booking) {
          return {
            success: false,
            message: "Booking not found.",
            error: "BOOKING_NOT_FOUND"
          };
        }

        await update(bookingRef, { status: "cancelled", cancelledAt: Date.now() });
        console.log("[ANTIGRAVITY][FOLLOWUP_AGENT] Booking status updated to: cancelled");
        result.message = "Aapki booking cancel kar di gayi hai.";
        break;
      }

      case "reschedule": {
        const { newTimeSlot } = data;
        if (!newTimeSlot) {
          return {
            success: false,
            message: "New time slot is required.",
            error: "MISSING_TIME_SLOT"
          };
        }

        await update(bookingRef, { "customer/timeSlot": newTimeSlot, rescheduledAt: Date.now() });
        console.log(`[ANTIGRAVITY][FOLLOWUP_AGENT] Booking rescheduled to: ${newTimeSlot}`);
        result.message = `Kaam reschedule ho gaya hai. Naya waqt: ${newTimeSlot}`;
        break;
      }

      default:
        console.log("[ANTIGRAVITY][FOLLOWUP_AGENT] Unknown follow-up type:", type);
        return { 
          success: false, 
          message: "Ghalat action type.",
          error: "UNKNOWN_TYPE"
        };
    }

    return result;
  } catch (error) {
    console.error("[ANTIGRAVITY][FOLLOWUP_AGENT] Firebase operation failed:", error.message);
    console.error("[ANTIGRAVITY][FOLLOWUP_AGENT] Error code:", error.code);
    
    // Return proper error instead of faking success
    return {
      success: false,
      message: `Operation failed: ${getFirebaseErrorMessage(error.code)}`,
      error: error.code || 'FIREBASE_ERROR',
      details: {
        originalMessage: error.message,
        code: error.code
      }
    };
  }
}

/**
 * Map Firebase error codes to user-friendly messages
 */
function getFirebaseErrorMessage(errorCode) {
  const errorMap = {
    'PERMISSION_DENIED': 'Aapko is operation ke liye permission nahi hai.',
    'NOT_FOUND': 'Booking ya data nahi mila.',
    'FAILED_PRECONDITION': 'Database is not ready. Please try again.',
    'ABORTED': 'Operation cancelled. Network issue.',
    'INVALID_ARGUMENT': 'Invalid data provided.',
    'AUTHENTICATION_REQUIRED': 'Please log in again.',
    'UNAUTHENTICATED': 'Authentication required.',
    'UNAVAILABLE': 'Service temporarily unavailable. Please try again later.',
    'INTERNAL': 'Database error. Please try again.',
    'UNKNOWN': 'Unknown error occurred.'
  };

  return errorMap[errorCode] || `Network error: ${errorCode}`;
}
