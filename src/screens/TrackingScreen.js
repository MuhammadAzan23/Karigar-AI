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
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../constants/colors";
import { T } from "../constants/typography";
import { triggerLocalNotification } from "../utils/notifications";

export default function TrackingScreen({ route, navigation }) {
  // Safe extracts to prevent any crash
  const { booking = {}, provider = {} } = route.params || {};

  const bookingId = booking.bookingId || booking.id || "#KAI-7821";
  const providerName = booking.providerName || provider.name || "Ali Raza Electric";
  const serviceType = booking.service || provider.service || "electrician";
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
                  onPress: () => navigation.navigate("Landing"),
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

  const handleSimulateNextStep = () => {
    const nextStep = Math.min(currentStep + 1, 4);
    setCurrentStep(nextStep);
    
    // Trigger Real-Time local push alerts!
    if (nextStep === 3) {
      triggerLocalNotification(
        "🔨 Kaam Shuru Ho Gaya!",
        `${providerName} ne aap ke ghar par kaam shuru kar diya hai.`
      );
    } else if (nextStep === 4) {
      triggerLocalNotification(
        "🏆 Kaam Mukammal!",
        `${providerName} ne kaam mukammal kar diya hai. Apni rating submit karein.`
      );
    }
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
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      
      {/* HEADER */}
      <BlurView intensity={50} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("Landing")}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* CONFIRMED BANNER */}
        <View style={styles.confirmedBanner}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={styles.bannerTitle}>✅ Booking Confirmed!</Text>
          <Text style={styles.bannerSubtitle}>Booking ID: {bookingId}</Text>
        </View>

        {/* STATUS TIMELINE */}
        <View style={styles.timelineCard}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[T.label, styles.sectionLabel]}>LATEST PROGRESS</Text>
          
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
            onPress={handleSimulateNextStep}
          >
            <Text style={styles.simulateBtnText}>Agla Step Simulate Karo →</Text>
          </TouchableOpacity>
        )}

        {/* KARIGAR INFO CARD */}
        <View style={styles.karigarCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
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
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={styles.reminderTitle}>🔔 Reminder Set</Text>
          <Text style={styles.reminderText}>Kam shuru hone se 1 ghanta pehle notification bhej diya jayega.</Text>
        </View>

        {/* FEEDBACK SECTION */}
        <View style={styles.feedbackCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[T.label, styles.sectionLabel]}>KARIGAR KO RATE KAREIN</Text>
          
          {!feedbackSubmitted ? (
            <View>
              {/* Star Rating Selectors */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setFeedbackStars(star)}>
                    <Text
                      style={[
                        styles.starText,
                        { color: star <= feedbackStars ? C.warning : "#2D4A60" },
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
                placeholderTextColor={C.textMuted}
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
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  confirmedBanner: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    overflow: "hidden",
    backgroundColor: C.glass,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.primary,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: C.textSecond,
    marginTop: 4,
  },
  timelineCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.teal,
    letterSpacing: 1.5,
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
    backgroundColor: C.glassBorder,
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
    color: C.bgDeep,
    fontWeight: "800",
    fontSize: 12,
  },
  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.bgDeep,
    borderWidth: 2,
    borderColor: C.glassBorder,
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
    fontWeight: "700",
  },
  stepSub: {
    fontSize: 12,
    marginTop: 2,
  },
  textPending: {
    color: C.textSecond,
    opacity: 0.5,
  },
  textActive: {
    color: C.textPrimary,
  },
  textHighlight: {
    color: C.primary,
    fontWeight: "700",
  },
  textMuted: {
    color: C.textSecond,
  },
  simulateBtn: {
    backgroundColor: C.bgDeep,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 12,
    alignItems: "center",
  },
  simulateBtnText: {
    color: C.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  karigarCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: "hidden",
  },
  karigarHeader: {
    marginBottom: 14,
  },
  karigarName: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
  },
  karigarSub: {
    fontSize: 11,
    color: C.teal,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 1.5,
  },
  karigarEta: {
    fontSize: 13,
    color: C.primary,
    fontWeight: "700",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  callBtnText: {
    color: C.textPrimary,
    fontWeight: "700",
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
    fontWeight: "700",
    fontSize: 13,
  },
  reminderCard: {
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: C.warning,
    backgroundColor: C.glass,
    overflow: "hidden",
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.warning,
  },
  reminderText: {
    fontSize: 12,
    color: C.textSecond,
    marginTop: 4,
    lineHeight: 18,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    backgroundColor: C.glass,
    overflow: "hidden",
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
    backgroundColor: C.bgDeep,
    borderWidth: 1,
    borderColor: C.border,
    color: C.textPrimary,
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
    color: C.bgDeep,
    fontWeight: "800",
    fontSize: 14,
  },
  disputeLink: {
    alignItems: "center",
    marginTop: 12,
  },
  disputeLinkText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  successFeedback: {
    backgroundColor: C.bgDeep,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  successFeedbackText: {
    color: C.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  successStars: {
    fontSize: 18,
    color: C.warning,
    marginTop: 8,
  },
});
