// ═══════════════════════════════════════════════════════
// Karigar AI — Result Screen
// ═══════════════════════════════════════════════════════
// Displays ranked providers with scores, AI reasoning,
// and a collapsible agent trace log.
// ═══════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { discoverProviders } from "../agents/discoveryAgent";
import { rankProviders } from "../agents/matchingAgent";
import {
  getStarRating,
  formatDistance,
  formatTime,
  getUrgencyColor,
} from "../utils/helpers";

const COLORS = {
  background: "#0D1B2A",
  primary: "#02C39A",
  secondary: "#028090",
  text: "#FFFFFF",
  card: "#1A2F45",
  cardBorder: "#253D57",
  muted: "#8899AA",
  gold: "#FFD93D",
  mintBg: "#02C39A18",
  mintBorder: "#02C39A55",
  traceBg: "#0A1520",
  traceText: "#4AE68A",
};

export default function ResultScreen({ route, navigation }) {
  const { intent, userLat, userLng } = route.params;

  const [loading, setLoading] = useState(true);
  const [topProvider, setTopProvider] = useState(null);
  const [otherProviders, setOtherProviders] = useState([]);
  const [reasoning, setReasoning] = useState("");
  const [trace, setTrace] = useState([]);
  const [traceExpanded, setTraceExpanded] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    runAgentPipeline();
  }, []);

  /**
   * Runs the full agent pipeline: Discovery → Matching → Display
   */
  const runAgentPipeline = () => {
    try {
      // Step 1: Discovery Agent
      const discovered = discoverProviders(intent, userLat, userLng);

      if (discovered.length === 0) {
        setLoading(false);
        setReasoning("Koi provider nahi mila is service ke liye is area mein.");
        return;
      }

      // Step 2: Matching Agent
      const { ranked, reasoning: topReasoning, trace: agentTrace } =
        rankProviders(discovered, intent);

      if (ranked.length > 0) {
        setTopProvider(ranked[0]);
        setOtherProviders(ranked.slice(1, 5));
      }

      setReasoning(topReasoning);
      setTrace(agentTrace);
      setLoading(false);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      console.log("[ANTIGRAVITY][RESULT_SCREEN] Pipeline error:", err.message);
      setLoading(false);
      setReasoning("Agent pipeline mein error aa gaya. Dobara try karein.");
    }
  };

  /**
   * Renders a score bar with label and percentage fill.
   */
  const renderScoreBar = (label, score, color) => (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>
          {score.toFixed(1)}
        </Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${Math.min(score, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );

  /**
   * Renders the top provider highlight card.
   */
  const renderTopCard = () => {
    if (!topProvider) return null;

    return (
      <View style={styles.topCard}>
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>🏆 #1 Best Match</Text>
        </View>

        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <Text style={styles.topName}>{topProvider.name}</Text>
            <Text style={styles.topService}>
              {topProvider.service_type.charAt(0).toUpperCase() +
                topProvider.service_type.slice(1)}
            </Text>
          </View>
          <View style={styles.topScoreBadge}>
            <Text style={styles.topScoreText}>
              {topProvider.scores.total.toFixed(1)}
            </Text>
            <Text style={styles.topScoreLabel}>/100</Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfoRow}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoEmoji}>📍</Text>
            <Text style={styles.quickInfoText}>
              {formatDistance(topProvider.distanceKm)}
            </Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoEmoji}>⭐</Text>
            <Text style={styles.quickInfoText}>
              {topProvider.rating} {getStarRating(topProvider.rating)}
            </Text>
          </View>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoEmoji}>💰</Text>
            <Text style={styles.quickInfoText}>
              Rs {topProvider.price_per_hour}/hr
            </Text>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.availRow}>
          <Text style={styles.availLabel}>🕐 Available:</Text>
          <View style={styles.availChips}>
            {topProvider.availability.map((slot) => (
              <View key={slot} style={styles.availChip}>
                <Text style={styles.availChipText}>
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reliability Badge */}
        <View style={styles.reliabilityRow}>
          <View
            style={[
              styles.reliabilityBadge,
              {
                backgroundColor:
                  topProvider.on_time_score >= 90 ? "#02C39A22" : "#FFD93D22",
                borderColor:
                  topProvider.on_time_score >= 90 ? COLORS.primary : COLORS.gold,
              },
            ]}
          >
            <Text
              style={[
                styles.reliabilityText,
                {
                  color:
                    topProvider.on_time_score >= 90
                      ? COLORS.primary
                      : COLORS.gold,
                },
              ]}
            >
              ✅ {topProvider.on_time_score}% On-Time
              {"  "}|{"  "}
              {topProvider.verified ? "🛡️ Verified" : "⚠️ Unverified"}
            </Text>
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreSectionTitle}>Score Breakdown</Text>
          {renderScoreBar("📍 Distance", topProvider.scores.distance, "#02C39A")}
          {renderScoreBar("⭐ Rating", topProvider.scores.rating, "#FFD93D")}
          {renderScoreBar("✅ Reliability", topProvider.scores.reliability, "#4AE68A")}
          {renderScoreBar("💰 Price", topProvider.scores.price, "#00B4D8")}
          {renderScoreBar("🔧 Specialization", topProvider.scores.specialization, "#9B5DE5")}
          {renderScoreBar("🛡️ Risk", topProvider.scores.risk, "#F15BB5")}
        </View>

        {/* AI Reasoning */}
        <View style={styles.reasoningBox}>
          <Text style={styles.reasoningTitle}>🤖 AI Reasoning</Text>
          <Text style={styles.reasoningText}>{reasoning}</Text>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
          <Text style={styles.bookButtonText}>📞 Book Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders a smaller card for other ranked providers.
   */
  const renderProviderCard = (provider, index) => (
    <View key={provider.id} style={styles.otherCard}>
      <View style={styles.otherCardHeader}>
        <View>
          <Text style={styles.otherRank}>#{index + 2}</Text>
          <Text style={styles.otherName}>{provider.name}</Text>
          <Text style={styles.otherArea}>{provider.area}</Text>
        </View>
        <View style={styles.otherScoreBadge}>
          <Text style={styles.otherScoreText}>
            {provider.scores.total.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.otherInfoRow}>
        <Text style={styles.otherInfoText}>
          📍 {formatDistance(provider.distanceKm)}
        </Text>
        <Text style={styles.otherInfoText}>
          ⭐ {provider.rating}
        </Text>
        <Text style={styles.otherInfoText}>
          💰 Rs {provider.price_per_hour}/hr
        </Text>
      </View>

      <View style={styles.otherInfoRow}>
        <Text style={styles.otherInfoText}>
          ✅ {provider.on_time_score}% On-Time
        </Text>
        <Text style={styles.otherInfoText}>
          {provider.verified ? "🛡️ Verified" : "⚠️ Unverified"}
        </Text>
      </View>
    </View>
  );

  // ─── Loading State ───
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>🤖 Agents kaam kar rahe hain...</Text>
        <Text style={styles.loadingSubtext}>
          Discovery → Matching → Ranking
        </Text>
      </View>
    );
  }

  // ─── Main View ───
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Best Karigar Found</Text>
          <Text style={styles.headerSubtitle}>
            {intent.service_type.charAt(0).toUpperCase() +
              intent.service_type.slice(1)}{" "}
            • {intent.location || "Karachi"}
          </Text>
        </View>

        {/* Top Provider */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {topProvider ? (
            renderTopCard()
          ) : (
            <View style={styles.noResultBox}>
              <Text style={styles.noResultText}>
                😔 Koi matching provider nahi mila
              </Text>
              <Text style={styles.noResultSubtext}>{reasoning}</Text>
            </View>
          )}

          {/* Other Providers */}
          {otherProviders.length > 0 && (
            <View style={styles.othersSection}>
              <Text style={styles.othersSectionTitle}>
                More Options ({otherProviders.length})
              </Text>
              {otherProviders.map((p, i) => renderProviderCard(p, i))}
            </View>
          )}

          {/* Agent Trace Log */}
          <TouchableOpacity
            style={styles.traceToggle}
            onPress={() => setTraceExpanded(!traceExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.traceToggleText}>
              {traceExpanded ? "▼" : "▶"} View Agent Reasoning Trace
            </Text>
          </TouchableOpacity>

          {traceExpanded && (
            <View style={styles.traceBox}>
              <Text style={styles.traceHeader}>
                ── ANTIGRAVITY AGENT TRACE ──
              </Text>
              {trace.map((line, i) => (
                <Text key={i} style={styles.traceLine}>
                  {line}
                </Text>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  loadingSubtext: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },

  // Top Card
  topCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.mintBorder,
    marginBottom: 20,
  },
  topBadge: {
    backgroundColor: COLORS.mintBg,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 14,
  },
  topBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topHeaderLeft: {
    flex: 1,
  },
  topName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  topService: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  topScoreBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
  },
  topScoreText: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: "900",
  },
  topScoreLabel: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.7,
  },

  // Quick Info
  quickInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background + "66",
    borderRadius: 12,
  },
  quickInfoItem: {
    alignItems: "center",
  },
  quickInfoEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  quickInfoText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  // Availability
  availRow: {
    marginTop: 14,
  },
  availLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  availChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  availChip: {
    backgroundColor: COLORS.secondary + "33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  availChipText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "600",
  },

  // Reliability
  reliabilityRow: {
    marginTop: 12,
  },
  reliabilityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  reliabilityText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  // Score Breakdown
  scoreSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  scoreSectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  scoreBarContainer: {
    marginBottom: 10,
  },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scoreBarLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  scoreBarValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Reasoning
  reasoningBox: {
    backgroundColor: COLORS.background + "88",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  reasoningTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  reasoningText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },

  // Book Button
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: "700",
  },

  // No Result
  noResultBox: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  noResultText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  noResultSubtext: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },

  // Other Providers
  othersSection: {
    marginBottom: 16,
  },
  othersSectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  otherCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
  },
  otherCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  otherRank: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  otherName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  otherArea: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  otherScoreBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  otherScoreText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  otherInfoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  otherInfoText: {
    color: COLORS.muted,
    fontSize: 12,
  },

  // Trace
  traceToggle: {
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  traceToggleText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  traceBox: {
    backgroundColor: COLORS.traceBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  traceHeader: {
    color: COLORS.traceText,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  traceLine: {
    color: COLORS.traceText,
    fontSize: 11,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
