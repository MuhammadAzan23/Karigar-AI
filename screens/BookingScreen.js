import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
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

export default function BookingScreen({ route, navigation }) {
  const { provider = {}, intent = {}, quote = {} } = route.params || {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(`[ANTIGRAVITY][BOOKING] Quote calculated: PKR ${quote.total || 950}`);
  }, []);

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !selectedSlot) {
      Alert.alert("Error", "Sab fields bharo pehle!");
      return;
    }

    setLoading(true);

    // Simulate database write
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const bookingId = "#KAI-" + Math.floor(1000 + Math.random() * 9000);

    const booking = {
      bookingId,
      providerName: provider.name || "Ali Raza Electric",
      service: provider.service_type || "electrician",
      providerId: provider.id || "P001",
      userName: name,
      userPhone: phone,
      userAddress: address,
      timeSlot: selectedSlot,
      location: intent.location || address,
      quote: quote.total || 950,
      quoteBreakdown: quote,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      reminderSet: true,
      estimatedArrival: "15-20 minutes",
    };

    setLoading(false);

    console.log(`[ANTIGRAVITY][BOOKING_AGENT] SMS simulation sent for ${bookingId}`);

    Alert.alert(
      "✅ Booking Ho Gayi!",
      `Booking ID: ${bookingId}\n\n${provider.name || "Karigar"} ko notify kar diya gaya hai.`,
      [
        {
          text: "Track Karo",
          onPress: () => {
            console.log(`[ANTIGRAVITY][TRACKING] Booking confirmed: ${bookingId}`);
            console.log("[ANTIGRAVITY][TRACKING] Reminder scheduled for 1hr before");
            navigation.navigate("TrackingScreen", { booking, provider });
          },
        },
      ]
    );
  };

  const slots = ["Subah 9-11", "Dopahar 12-2", "Shaam 4-6", "Raat 7-9"];
  const providerName = provider.name || "Ali Raza Electric";
  const initials = provider.initials || providerName.substring(0, 2).toUpperCase();
  const avatarBg = provider.avatar_bg || C.teal;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirm Karo</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* PROVIDER MINI CARD */}
          <View style={styles.miniCard}>
            <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarLetter}>{initials}</Text>
            </View>
            <View style={styles.miniDetails}>
              <Text style={styles.miniName}>{providerName}</Text>
              <Text style={styles.miniSub}>
                ⭐ {provider.rating || "4.9"}  ·  {provider.service_type || "Electrician"}
              </Text>
            </View>
          </View>

          {/* FORM FIELDS */}
          <View style={styles.formContainer}>
            <Text style={styles.fieldLabel}>APKA NAAM</Text>
            <TextInput
              style={styles.input}
              placeholder="Apna poora naam likhein"
              placeholderTextColor="#3D6680"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="03XXXXXXXXX"
              placeholderTextColor="#3D6680"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.fieldLabel}>PURA PATA</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghar / Shop ka mukammal pata likhein..."
              placeholderTextColor="#3D6680"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* TIME SLOT SELECTOR */}
          <View style={styles.slotsSection}>
            <Text style={styles.fieldLabel}>WAQT CONFIRM KARO</Text>
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotBtn,
                      isSelected ? styles.slotSelected : styles.slotUnselected,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.slotBtnText,
                        isSelected ? styles.slotTextSelected : styles.slotTextUnselected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PRICE BREAKDOWN CARD */}
          <View style={styles.breakdownCard}>
            <Text style={styles.fieldLabel}>QEEMAT KI TAFSEEL</Text>
            
            {quote.breakdown && quote.breakdown.length > 0 ? (
              quote.breakdown.map((item, idx) => (
                <View key={idx} style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>{item.label}</Text>
                  <Text style={styles.lineValue}>PKR {item.value}</Text>
                </View>
              ))
            ) : (
              // Simple default backup breakdown if quote parameters were empty
              <View>
                <View style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>Visit Fee</Text>
                  <Text style={styles.lineValue}>PKR 300</Text>
                </View>
                <View style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>Distance Charge</Text>
                  <Text style={styles.lineValue}>PKR 150</Text>
                </View>
                <View style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>Service Charge</Text>
                  <Text style={styles.lineValue}>PKR {provider.price_per_hour || 800}</Text>
                </View>
                <View style={styles.breakdownLine}>
                  <Text style={styles.lineLabel}>Complexity Charge</Text>
                  <Text style={styles.lineValue}>PKR 150</Text>
                </View>
              </View>
            )}

            {quote.discount > 0 && (
              <View style={styles.breakdownLine}>
                <Text style={styles.discountLabel}>- Discount</Text>
                <Text style={styles.discountValue}>- PKR {quote.discount}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.breakdownLine}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>PKR {quote.total || (600 + (provider.price_per_hour || 800))}</Text>
            </View>

            {quote.budgetNote && (
              <Text style={styles.budgetNote}>💡 {quote.budgetNote}</Text>
            )}
          </View>

          {/* CONFIRM BUTTON */}
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>Booking Confirm Karo ✓</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboard: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  miniCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
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
  miniDetails: {
    marginLeft: 12,
    flex: 1,
  },
  miniName: {
    color: C.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  miniSub: {
    color: C.body,
    fontSize: 13,
    marginTop: 2,
  },
  formContainer: {
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: C.teal,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  slotsSection: {
    marginTop: 4,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  slotBtn: {
    width: "48%",
    borderRadius: 10,
    paddingVertical: 12,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  slotSelected: {
    backgroundColor: C.primary,
  },
  slotUnselected: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
  },
  slotBtnText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  slotTextSelected: {
    color: C.bg,
  },
  slotTextUnselected: {
    color: C.white,
  },
  breakdownCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  breakdownLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  lineLabel: {
    fontSize: 13,
    color: C.body,
  },
  lineValue: {
    fontSize: 13,
    color: C.white,
  },
  discountLabel: {
    fontSize: 13,
    color: C.primary,
  },
  discountValue: {
    fontSize: 13,
    color: C.primary,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: C.white,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.primary,
  },
  budgetNote: {
    color: C.warning,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
  },
  confirmBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  confirmBtnText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 16,
  },
});
