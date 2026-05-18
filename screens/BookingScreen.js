import React, { useState } from "react";
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

export default function BookingScreen({ route, navigation }) {
  const { provider, intent, quote } = route.params || { provider: {}, intent: {}, quote: {} };
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("Subah 9-11");

  const timeSlots = ["Subah 9-11", "Dopahar 12-2", "Shaam 4-6"];

  const handleConfirm = () => {
    if (!name || !phone || !address) {
      alert("Pehle tamami fields mukammal karein!");
      return;
    }

    const booking = {
      id: "KAI-2847",
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      slot: selectedSlot,
      quote,
      status: "confirmed",
    };

    navigation.navigate("TrackingScreen", {
      booking,
      provider,
    });
  };

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
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* PROVIDER MINI CARD */}
          <View style={styles.providerMiniCard}>
            <View style={styles.miniDetails}>
              <Text style={styles.miniName}>{provider.name}</Text>
              <Text style={styles.miniService}>{provider.service_type}</Text>
            </View>
            <View style={styles.miniRatingContainer}>
              <Text style={styles.miniRating}>⭐ {provider.rating}</Text>
            </View>
          </View>

          {/* BOOKING DETAILS FORM */}
          <View style={styles.form}>
            <Text style={styles.formLabel}>APKA NAAM</Text>
            <TextInput
              style={styles.input}
              placeholder="Apna poora naam likhein"
              placeholderTextColor="#3D6680"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.formLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="03XXXXXXXXX"
              placeholderTextColor="#3D6680"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.formLabel}>PURA PATA</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Ghar / Shop ka mukammal pata likhein..."
              placeholderTextColor="#3D6680"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.formLabel}>WAQT CONFIRM KARO</Text>
            <View style={styles.slotsRow}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotButton,
                      isSelected ? styles.slotSelected : styles.slotUnselected,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, isSelected ? styles.textBg : styles.textWhite]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PRICE BREAKDOWN CARD */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>QEEMAT KI TAFSEEL</Text>
            
            <View style={styles.breakdownLine}>
              <Text style={styles.lineLabel}>Visit Fee</Text>
              <Text style={styles.lineValue}>PKR {quote.visitFee || 300}</Text>
            </View>

            <View style={styles.breakdownLine}>
              <Text style={styles.lineLabel}>Distance Charge</Text>
              <Text style={styles.lineValue}>PKR {quote.distanceCharge || 150}</Text>
            </View>

            <View style={styles.breakdownLine}>
              <Text style={styles.lineLabel}>Service Charge</Text>
              <Text style={styles.lineValue}>PKR {quote.serviceCharge || 400}</Text>
            </View>

            <View style={styles.breakdownLine}>
              <Text style={styles.lineLabel}>Urgency Adjustment</Text>
              <Text style={styles.lineValue}>PKR {quote.urgencyAdjustment || 0}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.breakdownLine}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>PKR {quote.total || 950}</Text>
            </View>

            <Text style={styles.budgetText}>💡 Budget-friendly rate applied</Text>
          </View>

          {/* CONFIRM BUTTON */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Booking Confirm Karo ✓</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  providerMiniCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  miniDetails: {
    flex: 1,
  },
  miniName: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.white,
  },
  miniService: {
    fontSize: 13,
    color: C.body,
    marginTop: 2,
  },
  miniRatingContainer: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniRating: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  slotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  slotButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
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
  slotText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textBg: {
    color: C.bg,
  },
  textWhite: {
    color: C.white,
  },
  breakdownCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
    marginBottom: 12,
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
  budgetText: {
    color: C.warning,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: C.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  confirmButtonText: {
    color: C.bg,
    fontWeight: "bold",
    fontSize: 16,
  },
});
