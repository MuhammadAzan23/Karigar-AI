// ═══════════════════════════════════════════════════════
// Karigar AI — Home Screen
// ═══════════════════════════════════════════════════════
// Main landing screen with multilingual text input,
// Gemini-powered intent extraction, and result display.
// ═══════════════════════════════════════════════════════

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { extractIntent } from "../agents/intentAgent";
import {
  formatTime,
  getUrgencyColor,
  getBudgetLabel,
  getComplexityBadge,
  getAreaCoordinates,
} from "../utils/helpers";

const COLORS = {
  background: "#0D1B2A",
  primary: "#02C39A",
  secondary: "#028090",
  text: "#FFFFFF",
  card: "#1A2F45",
  cardBorder: "#253D57",
  muted: "#8899AA",
  yellow: "#FFD93D",
  yellowBg: "#3D3200",
  inputBg: "#132438",
  inputBorder: "#2A4A6B",
};

export default function HomeScreen({ navigation }) {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /**
   * Triggers a fade-in + slide-up animation for the result card.
   */
  const animateResultIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Starts a subtle pulse animation on the search button.
   */
  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Handles the "Find Karigar" button press.
   * Calls the Intent Agent and displays results.
   */
  const handleSearch = async () => {
    if (!userInput.trim()) return;

    startPulse();
    setLoading(true);
    setIntent(null);
    setError(null);

    try {
      const result = await extractIntent(userInput);
      setIntent(result);
      animateResultIn();
    } catch (err) {
      console.log("[ANTIGRAVITY][HOME_SCREEN] Error:", err.message);
      setError("Kuch problem ho gayi. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates to ResultScreen with intent data.
   */
  const handleFindProviders = () => {
    if (!intent) return;

    const coords = getAreaCoordinates(intent.location);
    navigation.navigate("ResultScreen", {
      intent: intent,
      userLat: coords.lat,
      userLng: coords.lng,
    });
  };

  /**
   * Renders a single row in the intent result card.
   */
  const renderIntentRow = (label, value, color) => (
    <View style={styles.intentRow}>
      <Text style={styles.intentLabel}>{label}</Text>
      <Text style={[styles.intentValue, color ? { color } : null]}>
        {value || "—"}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚙️ Karigar AI</Text>
          <Text style={styles.subtitle}>Aap ko kya chahiye?</Text>
          <Text style={styles.tagline}>
            AI-powered home services across Karachi
          </Text>
        </View>

        {/* ── Service Chips ── */}
        <View style={styles.chipRow}>
          {["🔌 Electrician", "🔧 Plumber", "❄️ AC Tech", "📚 Tutor", "💅 Beautician"].map(
            (chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            )
          )}
        </View>

        {/* ── Input Area ── */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. AC theek karna hai, kal subah Gulshan mein..."
            placeholderTextColor={COLORS.muted}
            multiline
            numberOfLines={4}
            value={userInput}
            onChangeText={setUserInput}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.inputHint}>
            🌐 Urdu, Roman Urdu, English — sab chalega!
          </Text>
        </View>

        {/* ── Search Button ── */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!userInput.trim() || loading) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!userInput.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={COLORS.background} />
                <Text style={styles.searchButtonText}>
                  {"  "}AI soch raha hai...
                </Text>
              </View>
            ) : (
              <Text style={styles.searchButtonText}>Find Karigar →</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Error Message ── */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Intent Result Card ── */}
        {intent && (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>🧠 AI Intent Extracted</Text>
              <View
                style={[
                  styles.confidenceBadge,
                  {
                    backgroundColor:
                      intent.confidence_score >= 0.85
                        ? "#02C39A22"
                        : intent.confidence_score >= 0.75
                        ? "#FFD93D22"
                        : "#FF4D4D22",
                    borderColor:
                      intent.confidence_score >= 0.85
                        ? COLORS.primary
                        : intent.confidence_score >= 0.75
                        ? COLORS.yellow
                        : "#FF4D4D",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confidenceText,
                    {
                      color:
                        intent.confidence_score >= 0.85
                          ? COLORS.primary
                          : intent.confidence_score >= 0.75
                          ? COLORS.yellow
                          : "#FF4D4D",
                    },
                  ]}
                >
                  {Math.round(intent.confidence_score * 100)}% Confident
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {renderIntentRow(
              "🔧 Service",
              (intent.service_type || "").charAt(0).toUpperCase() +
                (intent.service_type || "").slice(1)
            )}
            {renderIntentRow("📍 Location", intent.location)}
            {renderIntentRow("🕐 Time", formatTime(intent.preferred_time))}
            {renderIntentRow(
              "⚡ Urgency",
              (intent.urgency || "").toUpperCase(),
              getUrgencyColor(intent.urgency)
            )}
            {renderIntentRow(
              "💰 Budget",
              getBudgetLabel(intent.budget_sensitivity)
            )}
            {renderIntentRow(
              "🔩 Complexity",
              getComplexityBadge(intent.job_complexity)
            )}

            {/* ── Clarification Box ── */}
            {intent.clarification_needed && (
              <View style={styles.clarificationBox}>
                <Text style={styles.clarificationTitle}>
                  💬 Clarification Needed
                </Text>
                <Text style={styles.clarificationText}>
                  {intent.clarification_question}
                </Text>
              </View>
            )}

            {/* ── Next Button ── */}
            {!intent.clarification_needed && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleFindProviders}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  Next: Find Providers →
                </Text>
              </TouchableOpacity>
            )}

            {intent.clarification_needed && (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: COLORS.secondary }]}
                onPress={handleFindProviders}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  Proceed Anyway →
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ── Bottom Spacer ── */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ═══════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.text,
    marginTop: 8,
    fontWeight: "600",
  },
  tagline: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "500",
  },

  // Input
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    lineHeight: 24,
  },
  inputHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },

  // Search Button
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Error
  errorBox: {
    backgroundColor: "#FF4D4D22",
    borderWidth: 1,
    borderColor: "#FF4D4D",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: 14,
    textAlign: "center",
  },

  // Result Card
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 14,
  },

  // Intent Rows
  intentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder + "44",
  },
  intentLabel: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "500",
  },
  intentValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "55%",
  },

  // Clarification
  clarificationBox: {
    backgroundColor: COLORS.yellowBg,
    borderWidth: 1,
    borderColor: COLORS.yellow,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  clarificationTitle: {
    color: COLORS.yellow,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  clarificationText: {
    color: COLORS.yellow,
    fontSize: 13,
    lineHeight: 20,
  },

  // Next Button
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  nextButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "700",
  },
});
