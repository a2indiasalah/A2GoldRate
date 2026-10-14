import React, { useState, useEffect } from "react";
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
import { saveAddedPurities, loadAddedPurities } from "../storage/Puritystorage";

const MAX_ITEMS = 19;
const MIN_DIGITS = 1;
const MAX_DIGITS = 6;
const DEFAULT_DIGITS = 6;
const emptyItem = () => ({ name: "", maxDigits: DEFAULT_DIGITS });

const clampDigits = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return DEFAULT_DIGITS;
  return Math.min(MAX_DIGITS, Math.max(MIN_DIGITS, Math.floor(num)));
};

// Reached from the "+ Add More" button on the Ad/Welcome screen. Lets the
// user type in up to 8 of their own purity fields (a name + how many
// digits its rate should allow), then combines those with whatever was
// already picked (Model purities, or checked Custom purities) and goes
// straight to Home — same as the normal Continue button, just with the
// extra fields folded in.
export default function AddMorePurityScreen({ navigation, route }) {
  const { basePurities = [], gramUnit = 1, modelNumber } = route?.params || {};

  const [items, setItems] = useState([emptyItem()]);

  // Pre-fill with whatever custom fields the user added last time, so
  // they don't have to retype them on every launch.
  useEffect(() => {
    (async () => {
      const saved = await loadAddedPurities();
      if (saved && saved.length) {
        setItems(
          saved.slice(0, MAX_ITEMS).map((it) => ({
            name: it.name || "",
            maxDigits: clampDigits(it.maxDigits),
          })),
        );
      }
    })();
  }, []);

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addRow = () => {
    setItems((prev) => (prev.length >= MAX_ITEMS ? prev : [...prev, emptyItem()]));
  };

  const removeRow = (index) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Keep at least one (empty) row on screen so the user can still type
      // a new field. Removing the only row just clears it.
      return next.length === 0 ? [emptyItem()] : next;
    });
  };

  const handleContinue = () => {
    // Only keep rows where the user actually typed a name.
    const validItems = items
      .map((it) => ({ name: it.name.trim(), maxDigits: clampDigits(it.maxDigits) }))
      .filter((it) => it.name.length > 0)
      // Don't duplicate a purity that's already in the base list (e.g.
      // typing "Silver" again when it's already checked above).
      .filter((it) => !basePurities.includes(it.name));

    saveAddedPurities(validItems);

    const addedNames = validItems.map((it) => it.name);
    const finalPurities = [...basePurities, ...addedNames];
    const customDigits = validItems.reduce((acc, it) => {
      acc[it.name] = it.maxDigits;
      return acc;
    }, {});

    setEspAllowedPurities(finalPurities);
    navigation.replace("Main", {
      screen: "HomeTabs",
      params: {
        screen: "Home",
        params: {
          modelNumber: modelNumber ? modelNumber.trim() : undefined,
          purities: finalPurities,
          gramUnit,
          customDigits,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
   
           behavior="padding"
            keyboardVerticalOffset={40}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add More Purities</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Add up to {MAX_ITEMS} of your own purity fields. "Digits" is how
            many digits the rate for that field can have on the Home screen
            (1 to {MAX_DIGITS}).
          </Text>

          {items.map((item, index) => (
            <View key={index} style={styles.itemBlock}>
              <View style={styles.row}>
                <View style={styles.nameField}>
                  <Text style={styles.inputLabel}>Purity Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={item.name}
                    onChangeText={(value) => updateItem(index, "name", value)}
                    placeholder="e.g. Purchase Rate"
                    placeholderTextColor="#666666"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeRow(index)}
                  style={styles.removeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={24} color="#888888" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Digits</Text>
              <View style={styles.digitRow}>
                {Array.from({ length: MAX_DIGITS }, (_, i) => i + 1).map(
                  (n) => {
                    const active = item.maxDigits === n;
                    return (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.digitButton,
                          active && styles.digitButtonActive,
                        ]}
                        onPress={() => updateItem(index, "maxDigits", n)}
                      >
                        <Text
                          style={[
                            styles.digitButtonText,
                            active && styles.digitButtonTextActive,
                          ]}
                        >
                          {n}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            </View>
          ))}

          {items.length < MAX_ITEMS && (
            <TouchableOpacity style={styles.addRowButton} onPress={addRow}>
              <Ionicons name="add-circle-outline" size={20} color="#D4AF37" />
              <Text style={styles.addRowText}>Add another</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: { width: 40, alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  container: { flexGrow: 1, padding: 24 },
  subtitle: { color: "#AAAAAA", fontSize: 15, marginBottom: 24, lineHeight: 21 },
  itemBlock: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 14 },
  nameField: { flex: 1, marginRight: 10 },
  inputLabel: { color: "#AAAAAA", fontSize: 14, marginBottom: 6 },
  textInput: {
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    fontSize: 17,
  },
  removeButton: { paddingBottom: 10 },
  digitRow: { flexDirection: "row" },
  digitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  digitButtonActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  digitButtonText: { color: "#AAAAAA", fontSize: 16, fontWeight: "600" },
  digitButtonTextActive: { color: "#111111" },
  addRowButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  addRowText: { color: "#D4AF37", fontSize: 16, fontWeight: "600", marginLeft: 6 },
  continueButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  continueButtonText: { color: "#111111", fontSize: 20, fontWeight: "700" },
});