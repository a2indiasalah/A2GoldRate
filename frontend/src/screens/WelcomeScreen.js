import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { setEspAllowedPurities } from "../api/goldRateApi";
import {
  getPuritiesForModel,
  getAllPurities,
  isGoldKarat,
} from "../constants/modelPurities";
import {
  saveCustomPurities,
  loadCustomPurities,
  saveGramUnit,
  loadGramUnit,
  saveMode,
  loadMode,
  loadAddedPurities,
} from "../storage/Puritystorage";

// Derived from MODEL_PURITY_MAP (+ a few extras not tied to any
// model) so this list always matches what's in modelPurities.js —
// no separate list to keep in sync by hand.
const PURITY_OPTIONS = getAllPurities();

// Models that use a 1 gram weight (5-digit rates). Every other model
// uses 10 gram (6-digit rates). Add more model numbers here if needed.
const ONE_GRAM_MODELS = ["A2GM24"];
const getModelGramUnit = (model) =>
  ONE_GRAM_MODELS.includes(String(model || "").trim().toUpperCase()) ? 1 : 10;

export default function WelcomeScreen({ navigation }) {
  const [mode, setMode] = useState("model"); // "model" | "custom"
  const [modelNumber, setModelNumber] = useState("");
  const [selectedPurities, setSelectedPurities] = useState([]);
  // Which weight the rates should be shown for on the Home screen: 1 gram or 10 gram.
  const [gramUnit, setGramUnit] = useState(10);
  // Set when the typed model number doesn't match any known model.
  const [modelError, setModelError] = useState("");

  // Used to scroll the Model Number input into view when the keyboard opens.
  const scrollRef = useRef(null);
  const inputY = useRef(0);

  // In Model mode the weight is fixed by the model (10 gram, or 1 gram for
  // A2GM24) and can't be changed. In Custom mode the user's choice is used.
  const effectiveGramUnit =
    mode === "model" ? getModelGramUnit(modelNumber) : gramUnit;

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

  // Works out the purity list for whichever mode is currently selected.
  // Shared by both Continue and Add More so they never drift apart.
  // Returns null (and sets modelError) if Model mode has an unknown number.
  const resolveBasePurities = () => {
    if (mode === "model") {
      const modelPurities = getPuritiesForModel(modelNumber);
      if (!modelPurities) {
        setModelError("Unknown model number. Please check and try again.");
        return null;
      }
      setModelError("");
      return modelPurities;
    }
    return selectedPurities;
  };

  const handleContinue = async () => {
    // Persist the choice so it's remembered next time the app opens.
    saveMode(mode);
    if (mode === "custom") {
      saveGramUnit(gramUnit);
      saveCustomPurities(selectedPurities);
    }

    const basePurities = resolveBasePurities();
    if (!basePurities) return;

    // Keep the custom purities saved earlier from the Add More screen.
    // Skip any whose name is already in the base list, and cap at 19.
    const savedAdded = await loadAddedPurities();
    const addedItems = (savedAdded || [])
      .filter((it) => it && it.name && !basePurities.includes(it.name))
      .slice(0, 19);

    const finalPurities = [...basePurities, ...addedItems.map((it) => it.name)];
    const customDigits = addedItems.reduce((acc, it) => {
      acc[it.name] = it.maxDigits;
      return acc;
    }, {});

    setEspAllowedPurities(finalPurities);
    navigation.replace("Main", {
      screen: "HomeTabs",
      params: {
        screen: "Home",
        params: {
          modelNumber: mode === "model" ? modelNumber.trim() : undefined,
          purities: finalPurities,
          gramUnit: effectiveGramUnit,
          customDigits,
        },
      },
    });
  };

  const handleAddMore = () => {
    saveMode(mode);
    if (mode === "custom") {
      saveGramUnit(gramUnit);
      saveCustomPurities(selectedPurities);
    }

    const basePurities = resolveBasePurities();
    if (!basePurities) return;

    navigation.navigate("AddMorePurity", {
      basePurities,
      gramUnit: effectiveGramUnit,
      modelNumber: mode === "model" ? modelNumber.trim() : undefined,
    });
  };

  const continueDisabled =
    mode === "model"
      ? modelNumber.trim().length === 0
      : selectedPurities.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // "padding" on both platforms: Android is edge-to-edge (target SDK 36),
        // so the system no longer resizes the window for the keyboard itself.
        behavior="padding"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to track gold rates
          </Text>

          {/* Gram unit selection — only selectable in Custom mode; Model mode sets it automatically */}
          <Text style={styles.sectionLabel}>Show rates per</Text>
          <View style={styles.gramToggleRow}>
            {[1, 10].map((unit) => {
              const active = effectiveGramUnit === unit;
              const locked = mode === "model";
              return (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.gramToggleButton,
                    active && styles.gramToggleButtonActive,
                    locked && styles.gramToggleButtonLocked,
                  ]}
                  disabled={locked}
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
            <View
              style={styles.inputGroup}
              onLayout={(e) => {
                inputY.current = e.nativeEvent.layout.y;
              }}
            >
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
                onFocus={() =>
                  setTimeout(
                    () =>
                      scrollRef.current?.scrollTo({
                        y: Math.max(0, inputY.current - 120),
                        animated: true,
                      }),
                    250,
                  )
                }
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
                      {isGoldKarat(purity) ? `${purity} Gold` : purity}
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

          <TouchableOpacity
            style={[
              styles.addMoreButton,
              continueDisabled && styles.addMoreButtonDisabled,
            ]}
            onPress={handleAddMore}
            disabled={continueDisabled}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={continueDisabled ? "#666666" : "#D4AF37"}
            />
            <Text
              style={[
                styles.addMoreButtonText,
                continueDisabled && styles.addMoreButtonTextDisabled,
              ]}
            >
              Add More
            </Text>
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
  gramToggleButtonLocked: { opacity: 0.45 },
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
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D4AF37",
    marginTop: 12,
  },
  addMoreButtonDisabled: { borderColor: "#555555" },
  addMoreButtonText: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  addMoreButtonTextDisabled: { color: "#666666" },
});