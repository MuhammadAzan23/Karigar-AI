// ═══════════════════════════════════════════════════════
// Schema Validation for API Responses
// ═══════════════════════════════════════════════════════
// Uses Zod for runtime schema validation

import { z } from 'zod';

/**
 * Schema for Intent Extraction Response from Gemini
 */
export const IntentSchema = z.object({
  service_type: z.enum(['electrician', 'plumber', 'AC technician', 'tutor', 'beautician', 'unknown']),
  location: z.string().default(''),
  preferred_time: z.string().default(''),
  budget_sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  job_complexity: z.enum(['basic', 'intermediate', 'complex']).default('basic'),
  confidence_score: z.number().min(0).max(1).default(0.0),
  clarification_needed: z.boolean().default(false),
  clarification_question: z.string().default(''),
});

export type Intent = z.infer<typeof IntentSchema>;

/**
 * Schema for Provider object
 */
export const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().min(0).max(5),
  review_count: z.number().nonnegative(),
  specialization: z.string().default('Home services'),
  price_per_hour: z.number().positive(),
  distanceKm: z.number().nonnegative(),
  latitude: z.number(),
  longitude: z.number(),
  avatar_bg: z.string().optional(),
  initials: z.string().optional(),
  on_time_score: z.number().optional(),
  matchScore: z.number().optional(),
});

export type Provider = z.infer<typeof ProviderSchema>;

/**
 * Schema for Booking object
 */
export const BookingSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  providerId: z.string(),
  serviceType: z.string(),
  location: z.string(),
  scheduledTime: z.number(), // Unix timestamp
  estimatedDuration: z.number().positive(), // Hours
  quotedPrice: z.number().positive(),
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed']).default('pending'),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Booking = z.infer<typeof BookingSchema>;

/**
 * Schema for Ranking Result from Matching Agent
 */
export const RankingResultSchema = z.object({
  reasoning: z.string(),
  ranked: z.array(ProviderSchema),
  totalCount: z.number().nonnegative(),
  filters_applied: z.array(z.string()).optional(),
});

export type RankingResult = z.infer<typeof RankingResultSchema>;

/**
 * Safe parse with error logging
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'Validation'
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[${context}] Validation failed:`, error.errors);
      return null;
    }
    console.error(`[${context}] Unexpected error:`, error);
    return null;
  }
}
