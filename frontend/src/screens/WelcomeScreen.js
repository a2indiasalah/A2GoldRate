import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { setEspAllowedPurities } from "../api/goldRateApi";
import { getPuritiesForModel } from "../constants/modelPurities";
import {
  saveCustomPurities,
  loadCustomPurities,
  saveGramUnit,
  loadGramUnit,
  saveMode,
  loadMode,
} from "../storage/Puritystorage";

const PURITY_OPTIONS = [
  "Date",
  "Time",
  "24CT",
  "22CT",
  "20CT",
  "18CT",
  "14CT",
  "9CT",
  "Silver",
];

export default function WelcomeScreen({ navigation }) {
  const [mode, setMode] = useState("model"); // "model" | "custom"
  const [modelNumber, setModelNumber] = useState("");
  const [selectedPurities, setSelectedPurities] = useState([]);
  // Which weight the rates should be shown for on the Home screen: 1 gram or 10 gram.
  const [gramUnit, setGramUnit] = useState(1);
  // Set when the typed model number doesn't match any known model.
  const [modelError, setModelError] = useState("");

  // Restore whatever the user picked last time (Custom purities, gram
  // unit, and mode) so they don't have to re-select it every launch.
  useEffect(() => {
    (async () => {
      const [savedMode, savedPurities, savedGramUnit] = await Promise.all([
        loadMode(),
        loadCustomPurities(),
        loadGramUnit(),
      ]);
      setMode(savedMode);
      setSelectedPurities(savedPurities);
      setGramUnit(savedGramUnit);
    })();
  }, []);

  const togglePurity = (purity) => {
    setSelectedPurities((prev) =>
      prev.includes(purity)
        ? prev.filter((p) => p !== purity)
        : [...prev, purity],
    );
  };

  const handleContinue = () => {
    // Persist the choice so it's remembered next time the app opens.
    saveMode(mode);
    saveGramUnit(gramUnit);
    if (mode === "custom") {
      saveCustomPurities(selectedPurities);
    }

    if (mode === "model") {
      const modelPurities = getPuritiesForModel(modelNumber);
      if (!modelPurities) {
        setModelError("Unknown model number. Please check and try again.");
        return;
      }
      setModelError("");
      setEspAllowedPurities(modelPurities);
      navigation.replace("Main", {
        screen: "HomeTabs",
        params: {
          screen: "Home",
          params: {
            modelNumber: modelNumber.trim(),
            purities: modelPurities,
            gramUnit,
          },
        },
      });
    } else {
      setEspAllowedPurities(selectedPurities);
      navigation.replace("Main", {
        screen: "HomeTabs",
        params: {
          screen: "Home",
          params: { purities: selectedPurities, gramUnit },
        },
      });
    }
  };

  const continueDisabled =
    mode === "model"
      ? modelNumber.trim().length === 0
      : selectedPurities.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to track gold rates
          </Text>

          {/* Gram unit selection — applies to both Model and Custom modes */}
          <Text style={styles.sectionLabel}>Show rates per</Text>
          <View style={styles.gramToggleRow}>
            {[1, 10].map((unit) => {
              const active = gramUnit === unit;
              return (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.gramToggleButton,
                    active && styles.gramToggleButtonActive,
                  ]}
                  onPress={() => setGramUnit(unit)}
                >
                  <Text
                    style={[
                      styles.gramToggleText,
                      active && styles.gramToggleTextActive,
                    ]}
                  >
                    {unit} gram{unit > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mode selection */}
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setMode("model")}
          >
            <View
              style={[
                styles.radioOuter,
                mode === "model" && styles.radioOuterActive,
              ]}
            >
              {mode === "model" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>Model</Text>
          </TouchableOpacity>

          {/* Model number input */}
          {mode === "model" && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Model Number</Text>
              <TextInput
                style={styles.textInput}
                value={modelNumber}
                onChangeText={(value) => {
                  setModelNumber(value);
                  if (modelError) setModelError("");
                }}
                placeholder="e.g. GRD-2100"
                placeholderTextColor="#666666"
                autoCapitalize="characters"
              />
              {modelError ? (
                <Text style={styles.modelErrorText}>{modelError}</Text>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setMode("custom")}
          >
            <View
              style={[
                styles.radioOuter,
                mode === "custom" && styles.radioOuterActive,
              ]}
            >
              {mode === "custom" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>Custom</Text>
          </TouchableOpacity>

          {/* Custom checkboxes */}
          {mode === "custom" && (
            <View style={styles.checkboxGroup}>
              {PURITY_OPTIONS.map((purity) => {
                const checked = selectedPurities.includes(purity);
                return (
                  <TouchableOpacity
                    key={purity}
                    style={styles.checkboxRow}
                    onPress={() => togglePurity(purity)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        checked && styles.checkboxBoxChecked,
                      ]}
                    >
                      {checked && (
                        <Ionicons name="checkmark" size={18} color="#111111" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      {purity === "Date" ||
                      purity === "Time" ||
                      purity === "Silver"
                        ? purity
                        : `${purity} Gold`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.continueButton,
              continueDisabled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={continueDisabled}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: { color: "#D4AF37", fontSize: 38, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#AAAAAA", fontSize: 19, marginBottom: 28 },
  sectionLabel: {
    color: "#AAAAAA",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  gramToggleRow: { flexDirection: "row", marginBottom: 24 },
  gramToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#1C1C1C",
    marginRight: 10,
  },
  gramToggleButtonActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  gramToggleText: { color: "#AAAAAA", fontSize: 17, fontWeight: "600" },
  gramToggleTextActive: { color: "#111111" },
  optionRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#666666",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterActive: { borderColor: "#D4AF37" },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#D4AF37",
  },
  optionLabel: { color: "#FFFFFF", fontSize: 20 },
  inputGroup: { paddingLeft: 34, marginBottom: 20, marginTop: -4 },
  inputLabel: { color: "#AAAAAA", fontSize: 17, marginBottom: 6 },
  textInput: {
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 19,
  },
  modelErrorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 6,
  },
  checkboxGroup: {
    marginTop: 8,
    marginBottom: 24,
    paddingLeft: 34,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 36,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#666666",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxBoxChecked: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  checkboxLabel: { color: "#EEEEEE", fontSize: 19 },
  continueButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  continueButtonDisabled: { backgroundColor: "#555555" },
  continueButtonText: { color: "#111111", fontSize: 20, fontWeight: "700" },
});