import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../constants/colors";
import { T } from "../constants/typography";

const { width } = Dimensions.get("window");

export default function ProviderScreen({ route, navigation }) {
  // Default values to prevent any possibility of a crash
  const { provider = {} } = route.params || {};

  const name = provider.name || "Ali Raza Electric";
  const initials = provider.initials || name.substring(0, 2).toUpperCase();
  
  // Property keys aligned with mockData
  const serviceType = provider.service || "electrician";
  const rating = provider.rating || 4.9;
  const reviewCount = provider.jobs || 120;
  const experienceYears = provider.experience || "4 saal";
  const onTimeScore = provider.onTime || 94;
  const cancellationRate = provider.cancelRate || 2;
  const pricePerHour = provider.price || 800;
  const specialization = provider.skills ? provider.skills.join(", ") : "general repair";
  const availability = provider.available ? ["morning", "afternoon", "evening"] : ["morning"];
  const avatarBg = provider.avatarColor || C.teal;

  useEffect(() => {
    console.log(`[ANTIGRAVITY][PROVIDER] ProviderScreen opened for: ${name}`);
  }, []);

  const handleBook = () => {
    // Generate a default valid quote to match screens/BookingScreen expectations
    const quote = {
      visitFee: 300,
      distanceCharge: 150,
      serviceCharge: pricePerHour,
      complexityCharge: 150,
      urgencyAdjustment: 0,
      surgeCharge: 0,
      discount: 0,
      total: 300 + 150 + pricePerHour + 150,
      budgetNote: null,
      breakdown: [
        { label: "Visit Fee", value: 300 },
        { label: "Distance Charge", value: 150 },
        { label: "Service Charge", value: pricePerHour },
        { label: "Complexity Charge", value: 150 },
      ]
    };

    console.log(`[ANTIGRAVITY][BOOKING] Quote calculated: PKR ${quote.total}`);
    navigation.navigate("Booking", { karigar: provider, intent: {}, quote });
  };

  const getSlotDetails = (slot) => {
    const s = slot.toLowerCase().trim();
    if (s.includes("morning") || s.includes("subah")) return "🌅 Subah 9-11";
    if (s.includes("afternoon") || s.includes("dopahar")) return "☀️ Dopahar 12-2";
    if (s.includes("evening") || s.includes("shaam")) return "🌆 Shaam 4-6";
    if (s.includes("night") || s.includes("raat")) return "🌙 Raat 7-9";
    return slot;
  };

  // Safe extract mock reviews
  const mockReviews = provider.reviews || [
    {
      name: "Ahmed R.",
      stars: 5,
      text: "Bohot acha kaam kiya, time par aaye aur kaam perfect tha!",
    },
    {
      name: "Sara M.",
      stars: 4,
      text: "Kaam theek tha, thora late aaye lekin kaam mein koi kami nahi thi.",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      
      {/* HEADER */}
      <BlurView intensity={50} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 40 }} />
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HERO AREA */}
        <View style={styles.heroArea}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.avatarCircle, { borderColor: C.primary }]}>
            <View style={[styles.avatarInner, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileService}>{serviceType.toUpperCase()}</Text>
          <Text style={styles.profileMeta}>
            ⭐ {rating.toFixed(1)}  |  {reviewCount} Jobs  |  {experienceYears} Exp
          </Text>
        </View>

        {/* 4 STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.statVal}>{rating.toFixed(1)}</Text>
            <Text style={styles.statLbl}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.statVal}>{onTimeScore}%</Text>
            <Text style={styles.statLbl}>On Time</Text>
          </View>

          <View style={styles.statCard}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.statVal}>{cancellationRate}%</Text>
            <Text style={styles.statLbl}>Cancel</Text>
          </View>

          <View style={styles.statCard}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.statVal}>PKR {pricePerHour}</Text>
            <Text style={styles.statLbl}>Per Hour</Text>
          </View>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.sectionCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[T.label, styles.sectionLabel]}>BAARE MEIN</Text>
          <Text style={styles.experienceText}>Tajurba: {experienceYears}</Text>
          <Text style={styles.aboutBodyText}>
            {provider.bio || "Certified professional karigar. Tamam kam tasalli bakhsh, munasib rates aur safety parameters ke mutabiq kiya jata hai."}
          </Text>

          <View style={styles.specContainer}>
            {specialization.split(",").map((spec, i) => (
              <View key={i} style={styles.specChip}>
                <Text style={styles.specChipText}>{spec.trim()}</Text>
              </View>
            ))}

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ Verified</Text>
            </View>
          </View>
        </View>

        {/* AVAILABILITY */}
        <View style={styles.sectionCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[T.label, styles.sectionLabel]}>FARIG WAQT</Text>
          <View style={styles.slotsRow}>
            {availability.map((slot, idx) => (
              <View key={idx} style={styles.slotChip}>
                <Text style={styles.slotChipText}>{getSlotDetails(slot)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* REVIEWS */}
        <View style={styles.sectionCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[T.label, styles.sectionLabel]}>CUSTOMERS KI RAY</Text>
          {mockReviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewStars}>{"★".repeat(review.stars || 5)}</Text>
                <Text style={styles.reviewDate}>{review.date || "Hal he mein"}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.text || review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomBuffer} />
      </ScrollView>

      {/* STICKY BOOK BUTTON */}
      <TouchableOpacity style={styles.stickyButton} onPress={handleBook} activeOpacity={0.95}>
        <Text style={styles.stickyButtonText}>Yeh Karigar Book Karo →</Text>
      </TouchableOpacity>
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
    flex: 1,
    textAlign: "center",
  },
  scroll: {
    paddingBottom: 24,
  },
  heroArea: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: C.glass,
    borderBottomWidth: 1,
    borderBottomColor: C.glassBorder,
    overflow: "hidden",
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 12,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: C.white,
    fontSize: 28,
    fontWeight: "800",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
  },
  profileService: {
    fontSize: 12,
    color: C.primary,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 1.5,
  },
  profileMeta: {
    color: C.textSecond,
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -20,
    justifyContent: "space-between",
    gap: 8,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.glass,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statVal: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    textAlign: "center",
  },
  statLbl: {
    fontSize: 10,
    color: C.textSecond,
    marginTop: 4,
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
    marginBottom: 12,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  aboutBodyText: {
    fontSize: 14,
    color: C.textSecond,
    lineHeight: 22,
  },
  specContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  specChip: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  specChipText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedBadge: {
    backgroundColor: C.primaryDim,
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotChip: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  slotChipText: {
    color: C.bgDeep,
    fontWeight: "800",
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewName: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 8,
  },
  reviewStars: {
    color: C.warning,
    fontSize: 12,
    flex: 1,
  },
  reviewDate: {
    color: C.textSecond,
    fontSize: 11,
  },
  reviewComment: {
    color: C.textSecond,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBuffer: {
    height: 80,
  },
  stickyButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.primary,
    paddingVertical: 18,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyButtonText: {
    color: C.bgDeep,
    fontSize: 16,
    fontWeight: "800",
  },
});
