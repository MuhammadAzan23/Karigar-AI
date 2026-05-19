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

export default function ProviderScreen({ route, navigation }) {
  // Default values to prevent any possibility of a crash
  const { provider = {} } = route.params || {};

  const name = provider.name || "Ali Raza Electric";
  const initials = provider.initials || name.substring(0, 2).toUpperCase();
  const serviceType = provider.service_type || "electrician";
  const rating = provider.rating || 4.9;
  const reviewCount = provider.review_count || 120;
  const experienceYears = provider.experience_years || 4;
  const onTimeScore = provider.on_time_score || 94;
  const cancellationRate = provider.cancellation_rate || 2;
  const pricePerHour = provider.price_per_hour || 800;
  const specialization = provider.specialization || "general repair";
  const availability = provider.availability || ["morning", "afternoon"];
  const avatarBg = provider.avatar_bg || C.teal;

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
    navigation.navigate("BookingScreen", { provider, intent: {}, quote });
  };

  const getSlotDetails = (slot) => {
    const s = slot.toLowerCase().trim();
    if (s.includes("morning") || s.includes("subah")) return "🌅 Subah 9-11";
    if (s.includes("afternoon") || s.includes("dopahar")) return "☀️ Dopahar 12-2";
    if (s.includes("evening") || s.includes("shaam")) return "🌆 Shaam 4-6";
    if (s.includes("night") || s.includes("raat")) return "🌙 Raat 7-9";
    return slot;
  };

  const mockReviews = [
    {
      name: "Ahmed R.",
      stars: 5,
      comment: "Bohot acha kaam kiya, time par aaye aur kaam perfect tha!",
      date: "2 din pehle",
    },
    {
      name: "Sara M.",
      stars: 4,
      comment: "Kaam theek tha, thora late aaye lekin kaam mein koi kami nahi thi.",
      date: "1 hafta pehle",
    },
    {
      name: "Usman K.",
      stars: 5,
      comment: "Highly recommended! Price bhi reasonable tha.",
      date: "2 hafta pehle",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HERO AREA */}
        <View style={styles.heroArea}>
          <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileService}>{serviceType.toUpperCase()}</Text>
          <Text style={styles.profileMeta}>
            ⭐ {rating.toFixed(1)}  |  {reviewCount} Jobs  |  {experienceYears} Yrs Exp
          </Text>
        </View>

        {/* 4 STATS ROW (offset positioning) */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{rating.toFixed(1)}</Text>
            <Text style={styles.statLbl}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statVal}>{onTimeScore}%</Text>
            <Text style={styles.statLbl}>On Time</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statVal}>{cancellationRate}%</Text>
            <Text style={styles.statLbl}>Cancel</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statVal}>PKR {pricePerHour}</Text>
            <Text style={styles.statLbl}>Per Hour</Text>
          </View>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>BAARE MEIN</Text>
          <Text style={styles.experienceText}>Tajurba: {experienceYears} saal ka tajarba</Text>
          <Text style={styles.aboutBodyText}>
            Main certified professional hoon. Tamam kam tasalli bakhsh, munasib rates aur safety parameters ke mutabiq kiya jata hai.
          </Text>

          <View style={styles.specContainer}>
            {specialization.split(",").map((spec, i) => (
              <View key={i} style={styles.specChip}>
                <Text style={styles.specChipText}>{spec.trim()}</Text>
              </View>
            ))}

            {provider.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✅ Verified Karigar</Text>
              </View>
            )}
          </View>
        </View>

        {/* AVAILABILITY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>FARIG WAQT</Text>
          <View style={styles.slotsRow}>
            {availability.map((slot, idx) => (
              <View key={idx} style={styles.slotChip}>
                <Text style={styles.slotChipText}>{getSlotDetails(slot)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MOCK REVIEWS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>CUSTOMERS KI RAY</Text>
          {mockReviews.map((review, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewStars}>{"★".repeat(review.stars)}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        {/* Empty padding block so scrollview content doesn't get covered by sticky bottom button */}
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
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    paddingBottom: 24,
  },
  heroArea: {
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    paddingTop: 10,
    paddingBottom: 30,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: C.primary,
    marginBottom: 12,
  },
  avatarText: {
    color: C.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.white,
  },
  profileService: {
    fontSize: 14,
    color: C.primary,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 1.5,
  },
  profileMeta: {
    color: C.body,
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -20,
    justifyContent: "space-between",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.white,
    textAlign: "center",
  },
  statLbl: {
    fontSize: 10,
    color: C.body,
    marginTop: 4,
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: C.teal,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  experienceText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.white,
    marginBottom: 6,
  },
  aboutBodyText: {
    fontSize: 14,
    color: C.body,
    lineHeight: 22,
  },
  specContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  specChip: {
    backgroundColor: C.bg,
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
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedText: {
    color: C.bg,
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
    color: C.bg,
    fontWeight: "bold",
    fontSize: 12,
  },
  reviewCard: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewName: {
    color: C.white,
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
    color: C.body,
    fontSize: 11,
  },
  reviewComment: {
    color: C.body,
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
    color: C.bg,
    fontSize: 16,
    fontWeight: "bold",
  },
});
