import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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

export default function ProviderScreen({ route, navigation }) {
  const { provider } = route.params || {
    provider: {
      name: "Ali Raza Electric",
      service_type: "AC Technician",
      rating: 4.9,
      distance: 0.8,
      reliability: 96,
      price: 750,
      score: 98,
    },
  };

  const handleBook = () => {
    navigation.navigate("BookingScreen", {
      provider,
      intent: {
        service_type: provider.service_type,
        location: "G-13, Islamabad",
        preferred_time: "Kal Subah",
        urgency: "medium",
      },
      quote: {
        visitFee: 300,
        distanceCharge: 150,
        serviceCharge: 400,
        urgencyAdjustment: 0,
        total: 850,
      },
    });
  };

  const days = [
    { name: "Mon", available: true },
    { name: "Tue", available: true },
    { name: "Wed", available: true },
    { name: "Thu", available: true },
    { name: "Fri", available: true },
    { name: "Sat", available: false },
    { name: "Sun", available: false },
  ];

  const timeSlots = ["Subah 9-11", "Dopahar 12-2", "Shaam 4-6"];

  const reviews = [
    { name: "Zainab Bibi", stars: 5, comment: "Bohot acha kaam kiya! Safai se aur time pe aaye." },
    { name: "Faisal Qureshi", stars: 5, comment: "Professional behavior aur rate bhi bilkul munasib hai." },
    { name: "Haris Jamil", stars: 4, comment: "Punctual thay. AC ki cooling ab bilkul perfect hai." },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Karigar Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* HEADER IMAGE AREA */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{provider.name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{provider.name}</Text>
          <Text style={styles.profileService}>{provider.service_type}</Text>
          <Text style={styles.profileStatsSummary}>⭐ {provider.rating}  |  247 Jobs  |  3 Years Exp</Text>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{provider.rating}</Text>
            <Text style={styles.statLbl}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{provider.reliability || 92}%</Text>
            <Text style={styles.statLbl}>On Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>3%</Text>
            <Text style={styles.statLbl}>Cancel Rate</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>PKR {provider.price || 800}</Text>
            <Text style={styles.statLbl}>Per Hour</Text>
          </View>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>BAARE MEIN</Text>
          <Text style={styles.aboutText}>
            Main aik certified professional hoon aur guzashta 3 saal se Islamabad aur Rawalpindi ke mukhtalif ilaqon mein quality service deliver kar raha hoon.
          </Text>
          <View style={styles.specChipsRow}>
            {["Premium Tools", "100% Guaranteed Work", "Clean Service"].map((spec) => (
              <View key={spec} style={styles.specChip}>
                <Text style={styles.specChipText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AVAILABILITY SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>FARIG WAQT</Text>
          <View style={styles.daysRow}>
            {days.map((day) => (
              <View
                key={day.name}
                style={[
                  styles.dayChip,
                  day.available ? styles.dayAvailable : styles.dayUnavailable,
                ]}
              >
                <Text style={[styles.dayText, day.available ? styles.textBg : styles.textMuted]}>
                  {day.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.timeSlotsRow}>
            {timeSlots.map((slot) => (
              <View key={slot} style={styles.timeSlotBadge}>
                <Text style={styles.timeSlotText}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* REVIEWS SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CUSTOMERS KI RAY</Text>
          {reviews.map((rev, idx) => (
            <View key={idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>{rev.name}</Text>
                <Text style={styles.reviewStars}>{"★".repeat(rev.stars)}</Text>
              </View>
              <Text style={styles.reviewComment}>{rev.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOOK BUTTON — STICKY BOTTOM */}
      <TouchableOpacity style={styles.bookStickyButton} onPress={handleBook}>
        <Text style={styles.bookStickyButtonText}>Yeh Karigar Book Karo →</Text>
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
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileHeaderCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.teal,
    justifyContent: "center",
    alignItems: "center",
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
  },
  profileStatsSummary: {
    fontSize: 13,
    color: C.body,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.white,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  aboutText: {
    color: C.white,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  specChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayChip: {
    width: "12%",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dayAvailable: {
    backgroundColor: C.primary,
  },
  dayUnavailable: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  textBg: {
    color: C.bg,
  },
  textMuted: {
    color: "#3D6680",
  },
  timeSlotsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  timeSlotBadge: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  timeSlotText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewName: {
    color: C.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  reviewStars: {
    color: C.warning,
    fontSize: 12,
  },
  reviewComment: {
    color: C.body,
    fontSize: 13,
    lineHeight: 18,
  },
  bookStickyButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.primary,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bookStickyButtonText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 16,
  },
});
