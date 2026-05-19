import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// DESIGN SYSTEM COLORS
const C = {
  bg:      '#0D1B2A',
  card:    '#1A2F45',
  primary: '#02C39A',
  teal:    '#028090',
  warning: '#F9C74F',
  danger:  '#E63946', // Red
  white:   '#FFFFFF',
  body:    '#8FB3C5',
  border:  '#1E3A5F',
  dark:    '#0A1520',
};

export default function DisputeScreen({ route, navigation }) {
  const { bookingId = "#KAI-7821" } = route.params || {};

  const [disputeType, setDisputeType] = useState(null);
  const [description, setDescription] = useState("");
  const [resolution, setResolution] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    console.log(`[ANTIGRAVITY][DISPUTE] Dispute screen opened for: ${bookingId}`);
  }, []);

  const handleSubmit = () => {
    if (!disputeType || !description.trim()) {
      Alert.alert("Error", "Dispute type aur description zaroor likhein!");
      return;
    }

    const ticketId = "#TKT-" + Math.floor(1000 + Math.random() * 9000);
    console.log(`[ANTIGRAVITY][FOLLOWUP] Dispute filed: ticket ${ticketId} resolved as ${resolution || "General support"}`);
    
    setSubmitted(true);
    
    Alert.alert(
      "✅ Shikayat Darj Ho Gayi!",
      `Ticket ID: ${ticketId}\n\nHum 24 ghante ke andar aapse rabta karenge aur aapke maslay ka hal nikalenge.`,
      [
        {
          text: "Theek Hai",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const types = [
    { id: "noshow", icon: "❌", label: "Karigar Nahi Aaya" },
    { id: "price", icon: "💰", label: "Price Dispute" },
    { id: "quality", icon: "⭐", label: "Kaam Theek Nahi" },
    { id: "reschedule", icon: "📅", label: "Reschedule Chahiye" },
  ];

  const resolutionOptions = ["Refund", "Reschedule", "Compensation"];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shikayat Darj Karein</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          <Text style={styles.subheadText}>Hum 24 ghante mein hal karenge</Text>

          {/* DISPUTE TYPES (2x2 grid) */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>SHIKAYAT KI KISM</Text>
            <View style={styles.grid}>
              {types.map((type) => {
                const isSelected = disputeType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.gridCard,
                      isSelected ? styles.cardSelected : styles.cardUnselected,
                    ]}
                    onPress={() => setDisputeType(type.id)}
                  >
                    <Text style={styles.cardIcon}>{type.icon}</Text>
                    <Text style={styles.cardLabel}>{type.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* DESCRIPTION TEXT INPUT */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>TAFSEEL LIKHEIN</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Kya masla hua? Tafseel se likhein..."
              placeholderTextColor="#3D6680"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* EVIDENCE SECTION */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>SABOOT (Optional)</Text>
            <TouchableOpacity
              style={styles.evidenceBox}
              onPress={() => Alert.alert("Camera", "Camera access verification completed! Mock image capture done.")}
            >
              <Text style={styles.evidenceIcon}>📷</Text>
              <Text style={styles.evidenceText}>Photo Add Karein</Text>
            </TouchableOpacity>
          </View>

          {/* RESOLUTION OPTIONS */}
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>AAP KYA CHAHTE HAIN?</Text>
            <View style={styles.chipsRow}>
              {resolutionOptions.map((option) => {
                const isSelected = resolution === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                    onPress={() => setResolution(option)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Shikayat Bhejein</Text>
          </TouchableOpacity>

          <Text style={styles.escalationText}>
            Agar 24 ghante mein jawab nahi mila toh human support se rabta karein.
          </Text>

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
  subheadText: {
    color: C.body,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: C.teal,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  gridCard: {
    width: "48%",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardSelected: {
    borderColor: C.danger,
    backgroundColor: "#2A1520",
  },
  cardUnselected: {
    borderColor: C.border,
    backgroundColor: C.card,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardLabel: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.teal,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontSize: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  evidenceBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  evidenceText: {
    color: C.body,
    fontSize: 13,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  chipSelected: {
    backgroundColor: C.danger,
    borderColor: C.danger,
  },
  chipUnselected: {
    backgroundColor: "transparent",
    borderColor: C.danger,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  chipTextSelected: {
    color: C.white,
  },
  chipTextUnselected: {
    color: C.danger,
  },
  submitBtn: {
    backgroundColor: C.danger,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  submitBtnText: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  escalationText: {
    color: C.body,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
