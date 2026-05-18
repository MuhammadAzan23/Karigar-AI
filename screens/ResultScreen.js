import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

const C = {
  bg:       '#0D1B2A',
  card:     '#1A2F45',
  primary:  '#02C39A',
  teal:     '#028090',
  warning:  '#F9C74F',
  danger:   '#E63946',
  white:    '#FFFFFF',
  body:     '#8FB3C5',
  border:   '#1E3A5F',
  dark:     '#0A1520',
};

export default function ResultScreen({ route, navigation }) {
  const { intent, providers } = route.params || { intent: {}, providers: [] };
  const [traceExpanded, setTraceExpanded] = useState(false);

  const topProvider = providers[0] || {};
  const otherProviders = providers.slice(1);

  // Mock logs for Antigravity Reasoning Trace
  const logs = [
    { type: "[DISCOVER]", text: "Checking active providers in Islamabad area G-13... Found 18 total." },
    { type: "[MATCH]", text: "Filtering based on service type 'AC Technician' and positive ratings... 9 matches found." },
    { type: "[SCORE]", text: "Calculating match scores based on distance (0.8km), average response time (< 5 mins), and pricing (PKR 750/hr)." },
    { type: "[DECIDE]", text: "Ali Raza selected as premium match with score 98/100." },
    { type: "[REASON]", text: "Provider holds solid track record, immediate availability, and matches client's budget priority." }
  ];

  const handleBook = (provider) => {
    navigation.navigate("BookingScreen", {
      provider,
      intent,
      quote: {
        visitFee: 300,
        distanceCharge: 150,
        serviceCharge: 400,
        urgencyAdjustment: intent.urgency === "high" ? 100 : 0,
        total: 850 + (intent.urgency === "high" ? 100 : 0),
      },
    });
  };

  const handleProviderPress = (provider) => {
    navigation.navigate("ProviderScreen", { provider });
  };

  const renderProviderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => handleProviderPress(item)}
    >
      <View style={styles.providerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerSubtitle}>{item.service_type} • {intent.location || "Islamabad"}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>{item.score}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.miniStat}>⭐ {item.rating}</Text>
        <Text style={styles.miniStat}>📍 {item.distance}km</Text>
        <Text style={styles.miniStat}>💰 PKR {item.price}</Text>
        <Text style={styles.miniStat}>✅ {item.reliability}%</Text>
      </View>
    </TouchableOpacity>
  );

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* REQUEST SUMMARY STRIP */}
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            ❄️ {intent.service_type || "AC Service"}  |  📍 {intent.location || "G-13"}  |  🕐 {intent.preferred_time || "Kal"}
          </Text>
        </View>

        {/* TOP PROVIDER CARD — HIGHLIGHTED */}
        {topProvider.name && (
          <TouchableOpacity
            style={styles.topCard}
            onPress={() => handleProviderPress(topProvider)}
          >
            <View style={styles.bestMatchBadge}>
              <Text style={styles.bestMatchText}>🏆 BEST MATCH</Text>
            </View>

            <Text style={styles.topName}>{topProvider.name}</Text>
            <Text style={styles.topService}>{topProvider.service_type}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⭐ {topProvider.rating}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📍 {topProvider.distance}km</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✅ {topProvider.reliability}%</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>💰 PKR {topProvider.price}</Text>
              </View>
            </View>

            {/* Score Bar */}
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBarHeader}>
                <Text style={styles.scoreBarLabel}>MATCH SCORE</Text>
                <Text style={styles.scoreBarValue}>{topProvider.score}/100</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${topProvider.score}%` }]} />
              </View>
            </View>

            {/* AI Reasoning box */}
            <View style={styles.reasoningBox}>
              <Text style={styles.reasoningTitle}>🤖 AI Reasoning:</Text>
              <Text style={styles.reasoningText}>{topProvider.reasoning}</Text>
            </View>

            {/* Two buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookButton} onPress={() => handleBook(topProvider)}>
                <Text style={styles.bookButtonText}>Book Karo ✓</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* OTHER OPTIONS — label */}
        <Text style={styles.otherOptionsLabel}>Doosre Karigar</Text>

        {/* PROVIDER LIST */}
        <FlatList
          data={otherProviders}
          renderItem={renderProviderCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        {/* AGENT TRACE SECTION */}
        <View style={styles.traceSection}>
          <TouchableOpacity
            style={styles.traceHeader}
            onPress={() => setTraceExpanded(!traceExpanded)}
          >
            <Text style={styles.traceHeaderTitle}>🔍 Antigravity Reasoning Trace</Text>
            <Text style={styles.traceHeaderToggle}>{traceExpanded ? "▲ Hide" : "▼ Show"}</Text>
          </TouchableOpacity>

          {traceExpanded && (
            <View style={styles.traceContent}>
              {logs.map((log, idx) => (
                <View key={idx} style={styles.logLine}>
                  <Text style={[
                    styles.logType,
                    log.type === "[DISCOVER]" ? { color: C.primary } :
                    log.type === "[MATCH]" ? { color: C.warning } :
                    log.type === "[SCORE]" ? { color: C.body } :
                    log.type === "[DECIDE]" ? { color: C.primary, fontWeight: "bold" } :
                    { color: C.white }
                  ]}>
                    {log.type}{" "}
                  </Text>
                  <Text style={styles.logText}>{log.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
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
  summaryStrip: {
    backgroundColor: C.card,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  summaryText: {
    color: C.body,
    fontSize: 13,
    fontWeight: "600",
  },
  topCard: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 16,
    padding: 20,
    margin: 12,
  },
  bestMatchBadge: {
    backgroundColor: C.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
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
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: C.border,
    flex: 1,
    marginHorizontal: 3,
    alignItems: "center",
  },
  badgeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },
  scoreBarContainer: {
    marginBottom: 16,
  },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  scoreBarLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
  },
  scoreBarValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: C.bg,
    borderRadius: 3,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  reasoningBox: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    marginBottom: 20,
  },
  reasoningTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: C.primary,
    marginBottom: 4,
  },
  reasoningText: {
    color: C.white,
    fontSize: 13,
    lineHeight: 18,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: C.border,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  callButtonText: {
    color: C.white,
    fontWeight: "600",
  },
  bookButton: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  bookButtonText: {
    color: C.bg,
    fontWeight: "bold",
  },
  otherOptionsLabel: {
    fontSize: 14,
    color: C.body,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
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
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.teal,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetter: {
    color: C.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.white,
  },
  providerSubtitle: {
    fontSize: 13,
    color: C.body,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: C.body,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  miniStat: {
    fontSize: 12,
    color: C.body,
  },
  traceSection: {
    margin: 12,
    backgroundColor: C.dark,
    borderRadius: 8,
    overflow: "hidden",
  },
  traceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  traceHeaderTitle: {
    color: C.teal,
    fontWeight: "bold",
    fontSize: 14,
  },
  traceHeaderToggle: {
    color: C.body,
    fontSize: 12,
  },
  traceContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  logLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  logType: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11,
  },
  logText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 11,
    color: C.white,
    flex: 1,
  },
});
