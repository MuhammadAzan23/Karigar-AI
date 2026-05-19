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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../constants/colors";
import { T } from "../constants/typography";

const { width } = Dimensions.get("window");

const getServiceIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("elect")) return "⚡";
  if (t.includes("plumb")) return "🔧";
  if (t.includes("ac") || t.includes("cool")) return "❄️";
  if (t.includes("tut") || t.includes("study") || t.includes("parh")) return "📚";
  if (t.includes("carp") || t.includes("wood") || t.includes("furn")) return "🪚";
  if (t.includes("beaut") || t.includes("nail") || t.includes("salon")) return "💅";
  return "🛠️";
};

export default function ResultScreen({ route, navigation }) {
  const { intent = {}, rankedProviders = [], providers = [] } = route.params || {};
  
  // Support both key names safely
  const activeProviders = rankedProviders.length > 0 ? rankedProviders : providers;

  const [traceVisible, setTraceVisible] = useState(false);
  const [waitlistAdded, setWaitlistAdded] = useState(false);

  useEffect(() => {
    console.log("[ANTIGRAVITY][RESULT] ResultScreen mounted");
    if (activeProviders && activeProviders.length > 0) {
      const topMatch = activeProviders[0];
      console.log(`[ANTIGRAVITY][RESULT] Top match: ${topMatch.name}`);
    } else {
      console.log("[ANTIGRAVITY][RESULT] No providers matched — showing waitlist fallback");
    }
  }, []);

  const handleBook = (provider) => {
    // Calculate quote dynamic prices
    const distanceVal = provider.distance || 1.0;
    const pricePerHourVal = provider.price || 800;
    
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
        intent.budget_sensitivity === "high" || intent.budget_sensitivity?.toLowerCase().includes("budget")
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
      intent.budget_sensitivity === "high" || intent.budget_sensitivity?.toLowerCase().includes("budget")
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
    navigation.navigate("Booking", { karigar: provider, intent, quote });
  };

  // Fallback if no matching providers
  if (activeProviders.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
        
        {/* HEADER */}
        <BlurView intensity={50} tint="dark" style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Karigar Dhundhein</Text>
          <View style={{ width: 40 }} />
        </BlurView>

        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackEmoji}>😔</Text>
          <Text style={[T.h2, styles.fallbackTitle]}>Filhaal koi karigar available nahi hai</Text>
          <Text style={[T.body, styles.fallbackSubtitle]}>
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
  const otherProviders = activeProviders.slice(1, 5);

  const scoreVal = topProvider.score || 95;
  const ratingVal = topProvider.rating || 4.8;
  const distanceVal = topProvider.distance || 0.8;
  const reliabilityVal = topProvider.onTime || 92;
  const priceVal = topProvider.price || 750;
  const specText = topProvider.service || "General";
  
  const reasoningMsg = topProvider.reasoning || 
    `${topProvider.name} selected: ${distanceVal.toFixed(1)}km away, ${reliabilityVal}% reliability, ${specText} specialist, reasonable pricing model matched.`;

  // Dynamic Trace logs array
  const traceLogs = [
    {
      tag: "DISCOVER",
      color: C.primary,
      msg: `Found ${activeProviders.length} providers for "${intent.service_type || specText}" near ${intent.location || "G-13, Islamabad"}`
    },
    {
      tag: "MATCH",
      color: C.warning,
      msg: `Scoring ${activeProviders.length} providers on 6 weighted factors...`
    },
    ...activeProviders.slice(0, 5).map(p => ({
      tag: "SCORE",
      color: C.textSecond,
      msg: `${p.name}: ${p.score || 85}/100`
    })),
    {
      tag: "DECIDE",
      color: C.primary,
      msg: `Selected: ${topProvider.name}`
    },
    {
      tag: "REASON",
      color: C.white,
      msg: reasoningMsg
    }
  ];

  const renderOtherProvider = ({ item }) => {
    const itemRating = item.rating || 4.7;
    const itemDistance = item.distance || 1.5;
    const itemPrice = item.price || 800;
    const itemReliability = item.onTime || 90;
    const itemScore = item.score || 80;

    return (
      <TouchableOpacity
        style={styles.providerCard}
        onPress={() => navigation.navigate("ProviderScreen", { provider: item })}
      >
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.providerRow}>
          <View style={[styles.avatarCircle, { backgroundColor: item.avatarColor || C.teal }]}>
            <Text style={styles.avatarLetter}>{item.initials}</Text>
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{item.name}</Text>
            <Text style={styles.providerSubtitle}>
              {item.service} · {item.location || "Islamabad"}
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
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      
      {/* HEADER */}
      <BlurView intensity={50} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Best Karigar Mila! 🎉</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* REQUEST SUMMARY STRIP */}
        <BlurView intensity={25} tint="dark" style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            {getServiceIcon(intent.service_type)} {intent.service_type || specText}  ·  📍 {intent.location || "G-13"}  ·  🕐 {intent.preferred_time || "Flexible"}
          </Text>
        </BlurView>

        {/* TOP PROVIDER CARD (BEST MATCH) */}
        <View style={styles.topCard}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.bestMatchBadge}>
            <Text style={styles.bestMatchText}>🏆 BEST MATCH</Text>
          </View>

          <Text style={styles.topName}>{topProvider.name}</Text>
          <Text style={styles.topService}>{topProvider.service}</Text>

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
              onPress={() => Alert.alert("Call", `Calling ${topProvider.name}...`)}
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
          keyExtractor={(item) => item.id}
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
    backgroundColor: C.bgDeep,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: "rgba(11,22,34,0.7)",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textPrimary,
  },
  scroll: {
    paddingBottom: 40,
  },
  summaryStrip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.primaryGlow,
    alignItems: "center",
    overflow: "hidden",
  },
  summaryText: {
    fontSize: 13,
    color: C.textSecond,
    fontWeight: "600",
  },
  topCard: {
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 20,
    padding: 20,
    margin: 16,
    overflow: "hidden",
    backgroundColor: C.glass,
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
    color: C.bgDeep,
    fontSize: 10,
    fontWeight: "bold",
  },
  topName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
  },
  topService: {
    fontSize: 14,
    color: C.primary,
    marginTop: 2,
    fontWeight: "600",
  },
  statsBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  statBadgeText: {
    color: C.textPrimary,
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
    fontSize: 10,
    fontWeight: "700",
    color: C.textSecond,
    letterSpacing: 1.5,
  },
  matchScoreVal: {
    fontSize: 26,
    fontWeight: "800",
    color: C.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  reasoningBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
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
    color: C.textSecond,
    fontSize: 13,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  callBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  callBtnText: {
    color: C.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  bookBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookBtnText: {
    color: C.bgDeep,
    fontWeight: "800",
    fontSize: 14,
  },
  otherTitle: {
    color: C.textSecond,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  otherList: {
    paddingHorizontal: 8,
  },
  providerCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: "hidden",
    backgroundColor: C.glass,
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
    fontWeight: "800",
  },
  providerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  providerSubtitle: {
    color: C.textSecond,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    color: C.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  scoreLabel: {
    color: C.textMuted,
    fontSize: 10,
  },
  miniStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  miniStatText: {
    fontSize: 12,
    color: C.textSecond,
  },
  miniStatSeparator: {
    fontSize: 12,
    color: C.textMuted,
    marginHorizontal: 6,
  },
  traceContainer: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  traceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  traceTitle: {
    color: C.teal,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  traceToggle: {
    color: C.teal,
    fontSize: 12,
    fontWeight: "600",
  },
  traceBody: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.glassBorder,
    backgroundColor: "#03060a",
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
    paddingHorizontal: 24,
  },
  fallbackEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  fallbackTitle: {
    textAlign: "center",
    marginBottom: 8,
    color: C.warning,
  },
  fallbackSubtitle: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    color: C.textSecond,
  },
  waitlistBtn: {
    backgroundColor: C.warning,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  waitlistBtnText: {
    color: C.bgDeep,
    fontWeight: "800",
    fontSize: 15,
  },
  successWaitlist: {
    backgroundColor: "rgba(6,214,160,0.15)",
    borderWidth: 1,
    borderColor: C.success,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  successWaitlistText: {
    color: C.success,
    fontWeight: "800",
    fontSize: 15,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  retryBtnText: {
    color: C.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  spacer: {
    height: 40,
  },
});
