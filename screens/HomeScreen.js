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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
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

export default function HomeScreen({ navigation }) {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState(null);
  const [clarificationReply, setClarificationReply] = useState("");
  const [isClarificationDone, setIsClarificationDone] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleChipTap = (chipText) => {
    // Strip emoji
    const cleanText = chipText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
    setUserInput(cleanText);
  };

  const handleSearch = () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setIntent(null);
    setIsClarificationDone(false);

    // Simulate Gemini API response after 1.5 seconds
    setTimeout(() => {
      setLoading(false);
      
      const lower = userInput.toLowerCase();
      let service_type = "AC Technician";
      let location = "G-13, Islamabad";
      let preferred_time = "Kal Subah";
      let urgency = "medium";
      let budget_sensitivity = "Medium";
      let job_complexity = "Medium";
      let clarification_needed = false;
      let clarification_question = "";

      if (lower.includes("electrician") || lower.includes("bijli")) {
        service_type = "Electrician";
        location = "F-11, Islamabad";
        urgency = "high";
      } else if (lower.includes("plumber") || lower.includes("pani")) {
        service_type = "Plumber";
        location = "D-12, Islamabad";
        urgency = "high";
      } else if (lower.includes("tutor") || lower.includes("parhana")) {
        service_type = "Tutor";
        location = "Gulshan, Karachi";
        urgency = "low";
      }

      if (lower.includes("budget") || lower.includes("sasta")) {
        budget_sensitivity = "High (Budget-Friendly)";
      }
      if (lower.includes("jaldi") || lower.includes("urgent")) {
        urgency = "high";
      }

      // Trigger clarification for Plumber as a demo of the clarification box
      if (service_type === "Plumber") {
        clarification_needed = true;
        clarification_question = "Kya pani ki tap leek hai ya main line mein masla hai?";
      }

      const extractedIntent = {
        service_type,
        location,
        preferred_time,
        urgency,
        budget_sensitivity,
        job_complexity,
        confidence_score: 0.94,
        clarification_needed,
        clarification_question,
      };

      setIntent(extractedIntent);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  const handleClarificationSubmit = () => {
    if (!clarificationReply.trim()) return;
    setIsClarificationDone(true);
    if (intent) {
      setIntent({
        ...intent,
        clarification_needed: false,
        job_complexity: "Complex (Investigated)",
        confidence_score: 0.98,
      });
    }
  };

  const handleNext = () => {
    // Generate realistic provider options based on service type
    const providers = [
      {
        id: "p1",
        name: "Ali Raza Electric",
        service_type: intent?.service_type || "AC Technician",
        rating: 4.9,
        distance: 0.8,
        reliability: 96,
        price: 750,
        score: 98,
        reasoning: "Ali Raza G-13 ke bilkul kareeb hain aur inki budget-friendly rating aapki zaroorat ke mutabiq best match karti hai.",
      },
      {
        id: "p2",
        name: "Kamran Khan",
        service_type: intent?.service_type || "AC Technician",
        rating: 4.7,
        distance: 1.2,
        reliability: 92,
        price: 800,
        score: 91,
        reasoning: "Kamran Khan ke paas same toolsets hain par inki distance thori zyada hai.",
      },
      {
        id: "p3",
        name: "Sajid & Sons",
        service_type: intent?.service_type || "AC Technician",
        rating: 4.6,
        distance: 1.9,
        reliability: 89,
        price: 700,
        score: 85,
        reasoning: "Sajid ka rate sasta hai par inka timing response delay ho sakta hai.",
      },
      {
        id: "p4",
        name: "Zahid Siddiqui",
        service_type: intent?.service_type || "AC Technician",
        rating: 4.8,
        distance: 2.5,
        reliability: 94,
        price: 900,
        score: 82,
        reasoning: "Premium category provider hain par inka price bracket high hai.",
      },
      {
        id: "p5",
        name: "Mubashir Mahmood",
        service_type: intent?.service_type || "AC Technician",
        rating: 4.5,
        distance: 3.1,
        reliability: 88,
        price: 650,
        score: 79,
        reasoning: "Sasta option hai par distance zyada hai.",
      },
    ];

    navigation.navigate("ResultScreen", {
      intent,
      providers,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER SECTION */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Image
                source={require("../assets/logo..png")}
                style={styles.homeLogo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.logoText}>KARIGAR AI</Text>
                <Text style={styles.subtext}>Aap ko kya chahiye?</Text>
              </View>
            </View>
            <View style={styles.avatar} />
          </View>

          {/* STATS BAR */}
          <View style={styles.statsBar}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>247</Text>
              <Text style={styles.statLabel}>Verified Karigar</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>&lt; 60s</Text>
              <Text style={styles.statLabel}>Booking Time</Text>
            </View>
          </View>

          {/* INPUT SECTION */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>APNI ZAROORAT BATAYEIN</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder={"Urdu, Roman Urdu ya English mein likhein...\n\nMisal: AC theek karna hai, kal subah G-13 mein, budget kam hai"}
              placeholderTextColor="#3D6680"
              value={userInput}
              onChangeText={setUserInput}
            />

            {/* SUGGESTION CHIPS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContainer}
            >
              {["⚡ Electrician", "🔧 Plumber", "❄️ AC Technician", "📚 Tutor"].map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => handleChipTap(chip)}
                >
                  <Text style={styles.chipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* FIND BUTTON */}
          <TouchableOpacity
            style={styles.findButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={C.bg} size="small" />
                <Text style={styles.findButtonText}> Dhoondh raha hoon...</Text>
              </View>
            ) : (
              <Text style={styles.findButtonText}>Karigar Dhundho →</Text>
            )}
          </TouchableOpacity>

          {/* CONFIDENCE CARD */}
          {intent && (
            <Animated.View style={[styles.confidenceCard, { opacity: fadeAnim }]}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.samajhLabel}>✅ Samajh Gaya</Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>{Math.round(intent.confidence_score * 100)}%</Text>
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>SERVICE</Text>
                  <Text style={styles.gridValue}>{intent.service_type}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>LOCATION</Text>
                  <Text style={styles.gridValue}>{intent.location}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>TIME</Text>
                  <Text style={styles.gridValue}>{intent.preferred_time}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>URGENCY</Text>
                  <View style={styles.urgencyContainer}>
                    <View
                      style={[
                        styles.urgencyDot,
                        {
                          backgroundColor:
                            intent.urgency === "high"
                              ? C.danger
                              : intent.urgency === "medium"
                              ? C.warning
                              : C.primary,
                        },
                      ]}
                    />
                    <Text style={styles.gridValue}>{intent.urgency.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>BUDGET</Text>
                  <Text style={styles.gridValue}>{intent.budget_sensitivity}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>COMPLEXITY</Text>
                  <Text style={styles.gridValue}>{intent.job_complexity}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* CLARIFICATION BOX */}
          {intent && intent.clarification_needed && !isClarificationDone && (
            <View style={styles.clarificationBox}>
              <Text style={styles.clarificationText}>🤔 {intent.clarification_question}</Text>
              <TextInput
                style={styles.clarificationInput}
                placeholder="Apna jawab likhein..."
                placeholderTextColor="#3D6680"
                value={clarificationReply}
                onChangeText={setClarificationReply}
              />
              <TouchableOpacity
                style={styles.clarificationButton}
                onPress={handleClarificationSubmit}
              >
                <Text style={styles.clarificationBtnText}>Jawab Do</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* NEXT BUTTON */}
          {intent && (!intent.clarification_needed || isClarificationDone) && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Karigar Dekho →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: C.white,
  },
  homeLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  backButtonText: {
    color: C.primary,
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 22,
  },
  subtext: {
    fontSize: 14,
    color: C.body,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.primary,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.white,
  },
  statLabel: {
    fontSize: 11,
    color: C.body,
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.teal,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    padding: 16,
    color: C.white,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipsScroll: {
    marginTop: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    color: C.primary,
    fontSize: 12,
  },
  findButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  findButtonText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  samajhLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.primary,
  },
  percentBadge: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
  },
  gridItem: {
    width: "50%",
  },
  gridLabel: {
    fontSize: 11,
    color: C.body,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.white,
    marginTop: 4,
  },
  urgencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  clarificationBox: {
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.warning,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  clarificationText: {
    color: C.warning,
    fontSize: 14,
    marginBottom: 12,
  },
  clarificationInput: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    color: C.white,
    fontSize: 14,
    marginBottom: 12,
  },
  clarificationButton: {
    backgroundColor: C.warning,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  clarificationBtnText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: C.teal,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  nextButtonText: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
