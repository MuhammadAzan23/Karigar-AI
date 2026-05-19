import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";

const { width } = Dimensions.get("window");

// DESIGN SYSTEM COLORS
const C = {
  bg:      '#0D1B2A',
  card:    '#1A2F45',
  primary: '#02C39A',
  teal:    '#028090',
  warning: '#F9C74F',
  danger:  '#E63946',
  white:   '#FFFFFF',
  body:    '#8FB3C5',
  border:  '#1E3A5F',
  dark:    '#0A1520',
};

// Local helpers to guarantee zero crashes and self-containment
const getServiceIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("elect")) return "⚡";
  if (t.includes("plumb")) return "🔧";
  if (t.includes("ac") || t.includes("cool")) return "❄️";
  if (t.includes("tut") || t.includes("study") || t.includes("parh")) return "📚";
  if (t.includes("beaut") || t.includes("nail") || t.includes("salon")) return "💅";
  return "🛠️";
};

export default function ResultScreen({ route, navigation }) {
  const { intent = {}, rankedProviders = [], providers = [] } = route.params || {};
  
  // Support both key names from previous and new versions of HomeScreen safely
  const activeProviders = rankedProviders.length > 0 ? rankedProviders : providers;

  const [traceVisible, setTraceVisible] = useState(false);
  const [waitlistAdded, setWaitlistAdded] = useState(false);

  useEffect(() => {
    console.log("[ANTIGRAVITY][RESULT] ResultScreen mounted");
    if (activeProviders && activeProviders.length > 0) {
      const topMatch = activeProviders[0];
      console.log(`[ANTIGRAVITY][RESULT] Top match: ${topMatch.name}`);
      console.log(`[ANTIGRAVITY][RESULT] Score: ${topMatch.matchScore || topMatch.score || 98}`);
    } else {
      console.log("[ANTIGRAVITY][RESULT] No providers matched — showing waitlist fallback");
    }
  }, []);

  const handleBook = (provider) => {
    // Calculate quote dynamic prices as per agents/pricingAgent rules
    const distanceVal = provider.distanceKm || provider.distance || 1.0;
    const pricePerHourVal = provider.price_per_hour || provider.price || 800;
    
    const quote = {
      visitFee: 300,
      distanceCharge:
        distanceVal <= 2 ? 100
        : distanceVal <= 5 ? 200
        : 350,
      serviceCharge: pricePerHourVal,
      complexityCharge:
        intent.job_complexity === "basic"
          ? 0
          : intent.job_complexity === "intermediate" ? 150 : 300,
      urgencyAdjustment:
        intent.urgency === "high" ? 200
        : intent.urgency === "medium" ? 100 : 0,
      surgeCharge: 0,
      discount:
        intent.budget_sensitivity === "high"
          ? Math.round(pricePerHourVal * 0.1)
          : 0,
    };

    quote.total =
      quote.visitFee +
      quote.distanceCharge +
      quote.serviceCharge +
      quote.complexityCharge +
      quote.urgencyAdjustment +
      quote.surgeCharge -
      quote.discount;

    quote.budgetNote =
      intent.budget_sensitivity === "high"
        ? "Budget-friendly rate applied (10% Discount)"
        : null;

    quote.breakdown = [
      { label: "Visit Fee", value: quote.visitFee },
      { label: "Distance Charge", value: quote.distanceCharge },
      { label: "Service Charge", value: quote.serviceCharge },
      { label: "Complexity Charge", value: quote.complexityCharge },
      { label: "Urgency Adjustment", value: quote.urgencyAdjustment },
    ];

    console.log(`[ANTIGRAVITY][BOOKING] Quote calculated: PKR ${quote.total}`);
    navigation.navigate("BookingScreen", { provider, intent, quote });
  };

  // Stress Test 1: No Provider Available Fallback
  if (activeProviders.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Karigar Dhundhein</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackEmoji}>😔</Text>
          <Text style={styles.fallbackTitle}>Filhaal koi karigar available nahi hai</Text>
          <Text style={styles.fallbackSubtitle}>
            Aap ke ilaqay mein is waqt koi matching active karigar farigh nahi hai. Kya aap waitlist mein shamil hona chahte hain?
          </Text>

          {!waitlistAdded ? (
            <TouchableOpacity
              style={styles.waitlistBtn}
              onPress={() => {
                setWaitlistAdded(true);
                Alert.alert("Waitlist!", "Aap ko waitlist mein add kar diya gaya hai. Karigar available hote hi notify kiya jayega.");
              }}
            >
              <Text style={styles.waitlistBtnText}>Waitlist Mein Add Karo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.successWaitlist}>
              <Text style={styles.successWaitlistText}>✓ Added to Waitlist successfully!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>Wapas Jayein</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const topProvider = activeProviders[0];
  const otherProviders = activeProviders.slice(1, 6);

  // Formatting reasoning safely
  const scoreVal = topProvider.matchScore || topProvider.score || 95;
  const ratingVal = topProvider.rating || 4.8;
  const distanceVal = topProvider.distanceKm || topProvider.distance || 0.8;
  const reliabilityVal = topProvider.on_time_score || topProvider.reliability || 92;
  const priceVal = topProvider.price_per_hour || topProvider.price || 750;
  const specText = topProvider.specialization || topProvider.service_type || "General";
  
  const reasoningMsg = topProvider.reasoning || 
    `${topProvider.name} selected: ${distanceVal.toFixed(1)}km away, ${reliabilityVal}% reliability, ${specText} specialist, reasonable pricing model matched.`;

  // Dynamic Trace logs array
  const traceLogs = [
    {
      tag: "DISCOVER",
      color: "#02C39A",
      msg: `Found ${activeProviders.length} providers for "${intent.service_type || "AC Technician"}" near ${intent.location || "G-13, Islamabad"}`
    },
    {
      tag: "MATCH",
      color: "#F9C74F",
      msg: `Scoring ${activeProviders.length} providers on 6 weighted factors...`
    },
    ...activeProviders.slice(0, 5).map(p => ({
      tag: "SCORE",
      color: "#8FB3C5",
      msg: `${p.name}: ${p.matchScore || p.score || 85}/100`
    })),
    {
      tag: "DECIDE",
      color: "#02C39A",
      msg: `Selected: ${topProvider.name}`
    },
    {
      tag: "REASON",
      color: "#FFFFFF",
      msg: reasoningMsg
    }
  ];

  const renderOtherProvider = ({ item }) => {
    const itemRating = item.rating || 4.7;
    const itemDistance = item.distanceKm || item.distance || 1.5;
    const itemPrice = item.price_per_hour || item.price || 800;
    const itemReliability = item.on_time_score || item.reliability || 90;
    const itemScore = item.matchScore || item.score || 80;

    return (
      <TouchableOpacity
        style={styles.providerCard}
        onPress={() => navigation.navigate("ProviderScreen", { provider: item })}
      >
        <View style={styles.providerRow}>
          <View style={[styles.avatarCircle, { backgroundColor: item.avatar_bg || C.teal }]}>
            <Text style={styles.avatarLetter}>{item.initials || item.name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{item.name}</Text>
            <Text style={styles.providerSubtitle}>
              {item.service_type} · {item.area || "Islamabad"}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreNumber}>{itemScore}</Text>
            <Text style={styles.scoreLabel}>pts</Text>
          </View>
        </View>
        <View style={styles.miniStatsRow}>
          <Text style={styles.miniStatText}>⭐ {itemRating.toFixed(1)}</Text>
          <Text style={styles.miniStatSeparator}>·</Text>
          <Text style={styles.miniStatText}>📍 {itemDistance.toFixed(1)}km</Text>
          <Text style={styles.miniStatSeparator}>·</Text>
          <Text style={styles.miniStatText}>💰 PKR {itemPrice}</Text>
          <Text style={styles.miniStatSeparator}>·</Text>
          <Text style={styles.miniStatText}>✅ {itemReliability}% on-time</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Best Karigar Mila! 🎉</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* REQUEST SUMMARY STRIP */}
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            {getServiceIcon(intent.service_type)} {intent.service_type || "AC Technician"}  ·  📍 {intent.location || "G-13"}  ·  🕐 {intent.preferred_time || "Flexible"}
          </Text>
        </View>

        {/* TOP PROVIDER CARD (BEST MATCH) */}
        <View style={styles.topCard}>
          <View style={styles.bestMatchBadge}>
            <Text style={styles.bestMatchText}>🏆 BEST MATCH</Text>
          </View>

          <Text style={styles.topName}>{topProvider.name}</Text>
          <Text style={styles.topService}>{topProvider.service_type}</Text>

          {/* 4 Stat Badges */}
          <View style={styles.statsBadgesContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>⭐ {ratingVal.toFixed(1)}</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>📍 {distanceVal.toFixed(1)}km</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>✅ {reliabilityVal}%</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>💰 PKR {priceVal}/hr</Text>
            </View>
          </View>

          {/* Match Score Progress */}
          <View style={styles.matchScoreContainer}>
            <View style={styles.matchScoreHeader}>
              <Text style={styles.matchScoreLabel}>MATCH SCORE</Text>
              <Text style={styles.matchScoreVal}>{scoreVal}/100</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${scoreVal}%` }]} />
            </View>
          </View>

          {/* AI Reasoning */}
          <View style={styles.reasoningBox}>
            <Text style={styles.reasoningLabel}>🤖 AI Reasoning:</Text>
            <Text style={styles.reasoningText}>{reasoningMsg}</Text>
          </View>

          {/* Call and Book Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert("Call", `Calling ${topProvider.phone || "0300-1234567"}...`)}
            >
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(topProvider)}>
              <Text style={styles.bookBtnText}>Book Karo ✓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTHER PROVIDERS SECTION */}
        <Text style={styles.otherTitle}>Doosre Karigar</Text>
        <FlatList
          data={otherProviders}
          renderItem={renderOtherProvider}
          keyExtractor={(item) => item.id || item.name}
          scrollEnabled={false}
          style={styles.otherList}
        />

        {/* ANTIGRAVITY REASONING TRACE */}
        <View style={styles.traceContainer}>
          <TouchableOpacity
            style={styles.traceHeader}
            onPress={() => setTraceVisible(!traceVisible)}
            activeOpacity={0.8}
          >
            <Text style={styles.traceTitle}>🔍 Antigravity Reasoning Trace</Text>
            <Text style={styles.traceToggle}>{traceVisible ? "▲ Hide" : "▼ Show"}</Text>
          </TouchableOpacity>

          {traceVisible && (
            <View style={styles.traceBody}>
              {traceLogs.map((log, index) => (
                <View key={index} style={styles.traceLogLine}>
                  <Text style={[styles.traceTag, { color: log.color }]}>[{log.tag}]</Text>
                  <Text style={[styles.traceMsg, { color: log.color }]}>{log.msg}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.bg,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    color: C.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.white,
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    paddingBottom: 24,
  },
  summaryStrip: {
    backgroundColor: C.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 13,
    color: C.body,
    fontWeight: "600",
  },
  topCard: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 16,
    padding: 20,
    margin: 12,
    elevation: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bestMatchBadge: {
    backgroundColor: C.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  bestMatchText: {
    color: C.bg,
    fontSize: 10,
    fontWeight: "bold",
  },
  topName: {
    fontSize: 20,
    fontWeight: "bold",
    color: C.white,
  },
  topService: {
    fontSize: 14,
    color: C.body,
    marginTop: 2,
  },
  statsBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  statBadgeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },
  matchScoreContainer: {
    marginTop: 16,
  },
  matchScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  matchScoreLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
  },
  matchScoreVal: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: C.bg,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.primary,
  },
  reasoningBox: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: C.primary,
    marginBottom: 4,
  },
  reasoningText: {
    color: C.white,
    fontSize: 13,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  callBtn: {
    flex: 1,
    backgroundColor: C.border,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  callBtnText: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  bookBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 14,
  },
  otherTitle: {
    color: C.body,
    fontSize: 14,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  otherList: {
    paddingHorizontal: 8,
  },
  providerCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: C.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  providerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    color: C.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  providerSubtitle: {
    color: C.body,
    fontSize: 13,
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    color: C.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  scoreLabel: {
    color: C.body,
    fontSize: 11,
  },
  miniStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  miniStatText: {
    fontSize: 12,
    color: C.body,
  },
  miniStatSeparator: {
    fontSize: 12,
    color: C.border,
    marginHorizontal: 6,
  },
  traceContainer: {
    backgroundColor: C.dark,
    borderRadius: 8,
    margin: 12,
    overflow: "hidden",
  },
  traceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  traceTitle: {
    color: C.teal,
    fontWeight: "bold",
    fontSize: 14,
  },
  traceToggle: {
    color: C.teal,
    fontSize: 12,
  },
  traceBody: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: "#050B12",
  },
  traceLogLine: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  traceTag: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "bold",
    fontSize: 11,
    marginRight: 6,
    width: 80,
  },
  traceMsg: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  fallbackContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: C.bg,
  },
  fallbackEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.warning,
    textAlign: "center",
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: C.body,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  waitlistBtn: {
    backgroundColor: C.warning,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  waitlistBtnText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 15,
  },
  successWaitlist: {
    backgroundColor: "rgba(2,195,154,0.15)",
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  successWaitlistText: {
    color: C.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  retryBtnText: {
    color: C.body,
    fontWeight: "bold",
    fontSize: 15,
  },
  spacer: {
    height: 40,
  },
});
