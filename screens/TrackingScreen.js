import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
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

export default function TrackingScreen({ route, navigation }) {
  const { booking, provider } = route.params || { booking: { id: "KAI-2847" }, provider: { name: "Ali Raza Electric", service_type: "AC Technician" } };
  const [currentStep, setCurrentStep] = useState(3); // Default at Step 3 (Active)
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Pulse animation for step 3 active dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSimulateStatus = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDispute = () => {
    navigation.navigate("DisputeScreen", { bookingId: booking.id });
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      alert("Pehle stars select karein!");
      return;
    }
    setFeedbackSubmitted(true);
    alert("Feedback jama karwane ka shukriya!");
  };

  const timelineSteps = [
    { id: 1, title: "Booking Confirmed", desc: "Aaj 10:32 AM", dotColor: C.primary },
    { id: 2, title: "Karigar Ko Bheja Gaya", desc: "Ali Electric notify ho gaya", dotColor: C.primary },
    { id: 3, title: "Karigar Raste Mein Hai", desc: "Expected 15 mins mein", dotColor: C.warning },
    { id: 4, title: "Kaam Shuru", desc: "Pending", dotColor: C.border },
    { id: 5, title: "Mukammal + Feedback", desc: "Pending", dotColor: C.border },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        {/* Secret/Simulator Button */}
        <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulateStatus}>
          <Text style={styles.simulateBtnText}>⚡ Next Step</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* BOOKING CONFIRMED BANNER */}
        <View style={styles.confirmedBanner}>
          <Text style={styles.bannerTitle}>✅ Booking Confirmed!</Text>
          <Text style={styles.bannerId}>Booking ID: #{booking.id}</Text>
        </View>

        {/* STATUS TIMELINE */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>STATUS TIMELINE</Text>
          <View style={styles.timelineContainer}>
            {/* The vertical line */}
            <View style={styles.timelineVerticalLine}>
              <View style={[styles.timelineDoneLine, { height: currentStep === 3 ? "50%" : currentStep === 4 ? "75%" : currentStep === 5 ? "100%" : "25%" }]} />
            </View>

            {timelineSteps.map((step) => {
              const isDone = step.id < currentStep;
              const isActive = step.id === currentStep;
              const isPending = step.id > currentStep;

              return (
                <View key={step.id} style={styles.timelineStepRow}>
                  {/* Circle Dot container */}
                  <View style={styles.dotContainer}>
                    {isActive ? (
                      <Animated.View
                        style={[
                          styles.timelineDotActivePulse,
                          { transform: [{ scale: pulseAnim }], backgroundColor: step.dotColor },
                        ]}
                      />
                    ) : null}
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isDone ? C.primary : isActive ? C.warning : C.border,
                          borderColor: isDone ? C.primary : isActive ? C.warning : C.border,
                        },
                      ]}
                    />
                  </View>

                  {/* Step Description */}
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isDone ? styles.textPrimary : isActive ? styles.textWarning : styles.textBody,
                      ]}
                    >
                      {step.id === 5 && currentStep === 5 ? "Mukammal ho gaya!" : step.title}
                    </Text>
                    <Text style={styles.stepDesc}>
                      {step.id === 4 && currentStep >= 4 ? "Kaam jari hai..." : step.id === 5 && currentStep >= 5 ? "Feedback pending" : step.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* KARIGAR INFO CARD */}
        {currentStep < 5 && (
          <View style={styles.karigarCard}>
            <View style={styles.karigarHeader}>
              <View>
                <Text style={styles.karigarName}>{provider.name}</Text>
                <Text style={styles.karigarService}>{provider.service_type}</Text>
              </View>
              <View style={styles.etaContainer}>
                <Text style={styles.etaText}>~15 mins</Text>
              </View>
            </View>

            <View style={styles.karigarButtonsRow}>
              <TouchableOpacity style={styles.callKarigarBtn}>
                <Text style={styles.callKarigarBtnText}>📞 Call Karigar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleDispute}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* REMINDER CARD */}
        {currentStep < 5 && (
          <View style={styles.reminderCard}>
            <Text style={styles.reminderText}>🔔 Reminder Set</Text>
            <Text style={styles.reminderDesc}>1 ghante pehle notification aayega</Text>
          </View>
        )}

        {/* FEEDBACK SECTION */}
        {currentStep === 5 && !feedbackSubmitted && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Karigar ko rate karein:</Text>
            
            {/* Stars Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.starIcon, rating >= star ? styles.starSelected : styles.starUnselected]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Apna experience likhein (Optional)..."
              placeholderTextColor="#3D6680"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity style={styles.feedbackSubmitBtn} onPress={handleSubmitFeedback}>
              <Text style={styles.feedbackSubmitBtnText}>Submit Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.disputeLink} onPress={handleDispute}>
              <Text style={styles.disputeLinkText}>Koi masla hai? Shikayat darj karein</Text>
            </TouchableOpacity>
          </View>
        )}

        {feedbackSubmitted && (
          <View style={[styles.confirmedBanner, { borderLeftColor: C.primary, marginTop: 12 }]}>
            <Text style={styles.bannerTitle}>🎉 Feedback Saved</Text>
            <Text style={styles.bannerId}>Karigar AI chunne ka bohot shukriya!</Text>
          </View>
        )}

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
  simulateBtn: {
    backgroundColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simulateBtnText: {
    color: C.primary,
    fontWeight: "bold",
    fontSize: 11,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  confirmedBanner: {
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.primary,
  },
  bannerId: {
    fontSize: 13,
    color: C.body,
    marginTop: 4,
  },
  timelineCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timelineContainer: {
    paddingLeft: 8,
    position: "relative",
  },
  timelineVerticalLine: {
    position: "absolute",
    left: 17,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: C.border,
    zIndex: 1,
  },
  timelineDoneLine: {
    width: "100%",
    backgroundColor: C.primary,
  },
  timelineStepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    zIndex: 2,
  },
  dotContainer: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    zIndex: 3,
  },
  timelineDotActivePulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.4,
    zIndex: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepDesc: {
    fontSize: 12,
    color: C.body,
    marginTop: 2,
  },
  textPrimary: {
    color: C.primary,
  },
  textWarning: {
    color: C.warning,
  },
  textBody: {
    color: C.body,
  },
  karigarCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  karigarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  karigarName: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.white,
  },
  karigarService: {
    fontSize: 13,
    color: C.body,
    marginTop: 2,
  },
  etaContainer: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  etaText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  karigarButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  callKarigarBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  callKarigarBtnText: {
    color: C.white,
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.danger,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: C.danger,
    fontWeight: "600",
  },
  reminderCard: {
    backgroundColor: C.card,
    borderLeftWidth: 4,
    borderLeftColor: C.warning,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.warning,
  },
  reminderDesc: {
    fontSize: 12,
    color: C.body,
    marginTop: 4,
  },
  feedbackCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.white,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  starIcon: {
    fontSize: 32,
  },
  starSelected: {
    color: C.warning,
  },
  starUnselected: {
    color: "#3D6680",
  },
  commentInput: {
    width: "100%",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  feedbackSubmitBtn: {
    width: "100%",
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackSubmitBtnText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 15,
  },
  disputeLink: {
    padding: 6,
  },
  disputeLinkText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "600",
  },
});
