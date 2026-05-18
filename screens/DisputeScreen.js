import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
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

export default function DisputeScreen({ route, navigation }) {
  const { bookingId } = route.params || { bookingId: "KAI-2847" };

  const [selectedIssue, setSelectedIssue] = useState("❌ Karigar Nahi Aaya");
  const [description, setDescription] = useState("");
  const [selectedResolution, setSelectedResolution] = useState("Refund");
  const [evidenceAdded, setEvidenceAdded] = useState(false);

  const issues = [
    "❌ Karigar Nahi Aaya",
    "💰 Price Dispute",
    "⭐ Kaam Theek Nahi",
    "📅 Reschedule Chahiye",
  ];

  const resolutions = ["Refund", "Reschedule", "Compensation"];

  const handleSubmit = () => {
    if (!description.trim()) {
      alert("Pehle tafseel likhein!");
      return;
    }
    alert("Shikayat darj kar li gayi hai. Hum jald az jald rabta karenge!");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Shikayat Darj Karein</Text>
          <Text style={styles.headerSubtitle}>Hum 24 ghante mein hal karenge</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* DISPUTE TYPE SELECTOR */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MASLA KYA HAI?</Text>
          <View style={styles.grid}>
            {issues.map((issue) => {
              const isSelected = selectedIssue === issue;
              return (
                <TouchableOpacity
                  key={issue}
                  style={[
                    styles.issueCard,
                    isSelected ? styles.issueSelected : styles.issueUnselected,
                  ]}
                  onPress={() => setSelectedIssue(issue)}
                >
                  <Text style={styles.issueText}>{issue}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* DESCRIPTION INPUT */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAFSEEL LIKHEIN</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Apne maslay ke baare mein likhein..."
            placeholderTextColor="#3D6680"
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* EVIDENCE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SABOOT (Optional)</Text>
          <TouchableOpacity
            style={styles.evidenceBox}
            onPress={() => setEvidenceAdded(true)}
          >
            <Text style={styles.evidenceText}>
              {evidenceAdded ? "✅ Saboot / Photo Add Ho Gayi!" : "📷 Photo Add Karein"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RESOLUTION OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AAP KYA CHAHTE HAIN?</Text>
          <View style={styles.resolutionContainer}>
            {resolutions.map((res) => {
              const isSelected = selectedResolution === res;
              return (
                <TouchableOpacity
                  key={res}
                  style={[
                    styles.resolutionChip,
                    isSelected ? styles.resSelected : styles.resUnselected,
                  ]}
                  onPress={() => setSelectedResolution(res)}
                >
                  <Text style={[styles.resText, isSelected ? styles.textBg : styles.textWhite]}>
                    {res}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Shikayat Bhejein</Text>
        </TouchableOpacity>

        {/* ESCALATION NOTE */}
        <Text style={styles.escalationNote}>
          Agar 24 ghante mein jawab nahi mila toh human support se milein
        </Text>

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
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.body,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.body,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  issueCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  issueSelected: {
    backgroundColor: "#2E1C24",
    borderWidth: 2,
    borderColor: C.danger,
  },
  issueUnselected: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  issueText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  textArea: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    color: C.white,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: "top",
  },
  evidenceBox: {
    backgroundColor: C.card,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  evidenceText: {
    color: C.body,
    fontSize: 13,
    fontWeight: "600",
  },
  resolutionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  resolutionChip: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  resSelected: {
    backgroundColor: C.danger,
  },
  resUnselected: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  resText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textBg: {
    color: C.white,
  },
  textWhite: {
    color: C.body,
  },
  submitButton: {
    backgroundColor: C.danger,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: C.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  escalationNote: {
    fontSize: 12,
    color: C.body,
    textAlign: "center",
    marginBottom: 20,
  },
});
