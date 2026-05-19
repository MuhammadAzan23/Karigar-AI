import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";

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

export default function TrackingScreen({ route, navigation }) {
  // Safe extracts to prevent any crash
  const { booking = {}, provider = {} } = route.params || {};

  const bookingId = booking.bookingId || "#KAI-7821";
  const providerName = booking.providerName || provider.name || "Ali Raza Electric";
  const serviceType = booking.service || provider.service_type || "electrician";
  const timeSlot = booking.timeSlot || "Subah 9-11";
  
  // 0=confirmed, 1=notified, 2=enroute, 3=started, 4=complete
  const [currentStep, setCurrentStep] = useState(2);
  const [feedbackStars, setFeedbackStars] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Pulse animation for the active step
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log(`[ANTIGRAVITY][TRACKING] Booking confirmed: ${bookingId}`);
    console.log("[ANTIGRAVITY][TRACKING] Reminder scheduled for 1hr before");

    const startPulsing = () => {
      pulseAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulsing();
  }, [currentStep]);

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking?",
      "Kya aap waqai is booking ko cancel karna chahte hain?",
      [
        { text: "Nahi" },
        {
          text: "Haan, Cancel Karo",
          style: "destructive",
          onPress: () => {
            console.log(`[ANTIGRAVITY][FOLLOWUP] Booking cancelled: ${bookingId}`);
            Alert.alert(
              "Cancelled",
              "Aap ki booking cancel kar di gayi hai.",
              [
                {
                  text: "Wapas Home Par",
                  onPress: () => navigation.navigate("HomeScreen"),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const submitFeedback = () => {
    if (feedbackStars === 0) {
      Alert.alert("Error", "Karigar ko rate karne ke liye kam se kam 1 star zaroor select karein.");
      return;
    }
    setFeedbackSubmitted(true);
    console.log(`[ANTIGRAVITY][FOLLOWUP] Rating submitted for booking ${bookingId}`);
    Alert.alert("Shukriya! 🎉", "Aapka feedback record ho gaya hai!");
  };

  const steps = [
    { icon: "✅", title: "Booking Confirmed", sub: "Aaj booking ho gayi hai" },
    { icon: "✅", title: "Karigar Notify Hua", sub: `${providerName} ko notify kiya gaya` },
    { icon: "🔄", title: "Karigar Raste Mein", sub: "~15 minute mein pahunch raha hai" },
    { icon: "🔨", title: "Kaam Shuru", sub: "Ghar par kaam shuru ho chuka hai" },
    { icon: "🏆", title: "Kaam Mukammal", sub: "Kaam tasalli bakhsh mukammal ho gaya" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("HomeScreen")}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* CONFIRMED BANNER */}
        <View style={styles.confirmedBanner}>
          <Text style={styles.bannerTitle}>✅ Booking Confirmed!</Text>
          <Text style={styles.bannerSubtitle}>Booking ID: {bookingId}</Text>
        </View>

        {/* STATUS TIMELINE */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionLabel}>LATEST PROGRESS</Text>
          
          <View style={styles.timelineWrapper}>
            {/* Background Line */}
            <View style={styles.timelineLine} />

            {steps.map((step, idx) => {
              const isDone = idx < currentStep;
              const isActive = idx === currentStep;
              const isPending = idx > currentStep;

              return (
                <View key={idx} style={styles.stepContainer}>
                  
                  {/* Step Dot Container */}
                  <View style={styles.dotContainer}>
                    {isActive ? (
                      <Animated.View style={[styles.activeDot, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.activeDotIcon}>{step.icon}</Text>
                      </Animated.View>
                    ) : isDone ? (
                      <View style={styles.doneDot}>
                        <Text style={styles.doneDotIcon}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingDot}>
                        <Text style={styles.pendingDotIcon}>{step.icon}</Text>
                      </View>
                    )}
                  </View>

                  {/* Step Text Contents */}
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isPending ? styles.textPending : styles.textActive,
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepSub,
                        isActive ? styles.textHighlight : styles.textMuted,
                      ]}
                    >
                      {isActive ? step.sub : isPending ? "Pending" : "Completed"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* DEMO STEP CONTROLLER SIMULATOR */}
        {currentStep < 4 && (
          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={() => setCurrentStep((prev) => Math.min(prev + 1, 4))}
          >
            <Text style={styles.simulateBtnText}>Agla Step Simulate Karo →</Text>
          </TouchableOpacity>
        )}

        {/* KARIGAR INFO CARD */}
        <View style={styles.karigarCard}>
          <View style={styles.karigarHeader}>
            <Text style={styles.karigarName}>{providerName}</Text>
            <Text style={styles.karigarSub}>{serviceType.toUpperCase()}</Text>
            <Text style={styles.karigarEta}>Estimated Arrival: {booking.estimatedArrival || "~15 minutes"}</Text>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Alert.alert("Call", `Calling ${providerName}...`)}
            >
              <Text style={styles.callBtnText}>📞 Call Karigar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* REMINDER CARD */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>🔔 Reminder Set</Text>
          <Text style={styles.reminderText}>Kam shuru hone se 1 ghanta pehle notification bhej diya jayega.</Text>
        </View>

        {/* FEEDBACK SECTION */}
        <View style={styles.feedbackCard}>
          <Text style={styles.sectionLabel}>KARIGAR KO RATE KAREIN</Text>
          
          {!feedbackSubmitted ? (
            <View>
              {/* Star Rating Selectors */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setFeedbackStars(star)}>
                    <Text
                      style={[
                        styles.starText,
                        { color: star <= feedbackStars ? C.warning : "#3D6680" },
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.feedbackInput}
                placeholder="Apna tajurba likhein (Optional)..."
                placeholderTextColor="#3D6680"
                multiline
                numberOfLines={3}
                value={feedbackText}
                onChangeText={setFeedbackText}
              />

              <TouchableOpacity style={styles.submitFeedbackBtn} onPress={submitFeedback}>
                <Text style={styles.submitFeedbackText}>Feedback Submit Karo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.disputeLink}
                onPress={() => navigation.navigate("DisputeScreen", { bookingId })}
              >
                <Text style={styles.disputeLinkText}>Shikayat Hai?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successFeedback}>
              <Text style={styles.successFeedbackText}>✅ Feedback Submit Ho Gaya!</Text>
              <Text style={styles.successStars}>{"★".repeat(feedbackStars)} — Shukriya!</Text>
            </View>
          )}
        </View>

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
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  confirmedBanner: {
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.primary,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: C.body,
    marginTop: 4,
  },
  timelineCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: C.teal,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  timelineWrapper: {
    position: "relative",
    paddingLeft: 12,
  },
  timelineLine: {
    position: "absolute",
    left: 25,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: C.border,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  dotContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    zIndex: 10,
  },
  activeDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  activeDotIcon: {
    fontSize: 12,
  },
  doneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneDotIcon: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 12,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  pendingDotIcon: {
    fontSize: 10,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepSub: {
    fontSize: 12,
    marginTop: 2,
  },
  textPending: {
    color: C.body,
    opacity: 0.5,
  },
  textActive: {
    color: C.white,
  },
  textHighlight: {
    color: C.primary,
    fontWeight: "600",
  },
  textMuted: {
    color: C.body,
  },
  simulateBtn: {
    backgroundColor: C.dark,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 12,
    alignItems: "center",
  },
  simulateBtnText: {
    color: C.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  karigarCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  karigarHeader: {
    marginBottom: 14,
  },
  karigarName: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.white,
  },
  karigarSub: {
    fontSize: 11,
    color: C.teal,
    fontWeight: "bold",
    marginTop: 2,
    letterSpacing: 1.5,
  },
  karigarEta: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  callBtnText: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: C.danger,
    fontWeight: "bold",
    fontSize: 13,
  },
  reminderCard: {
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.warning,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.warning,
  },
  reminderText: {
    fontSize: 12,
    color: C.body,
    marginTop: 4,
    lineHeight: 18,
  },
  feedbackCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  starText: {
    fontSize: 36,
  },
  feedbackInput: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    color: C.white,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitFeedbackBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  submitFeedbackText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 14,
  },
  disputeLink: {
    alignItems: "center",
    marginTop: 12,
  },
  disputeLinkText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "bold",
  },
  successFeedback: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  successFeedbackText: {
    color: C.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  successStars: {
    fontSize: 18,
    color: C.warning,
    marginTop: 8,
  },
});
