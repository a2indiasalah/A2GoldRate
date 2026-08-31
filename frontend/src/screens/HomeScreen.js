import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { getDefaultRates, setLatestRates } from "../api/goldRateApi";
import { loadSavedRates, saveRate } from "../storage/rateStorage";

// Owns its own 1-second tick so the clock updating never re-renders HomeScreen
// (and therefore never touches the FlatList/TextInput while you're typing).
function DateTimeRow({ purity, formatter }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.purity}>{purity}</Text>
      <Text style={styles.dateTimeValue}>{formatter(now)}</Text>
    </View>
  );
}

export default function HomeScreen({ route }) {
  const purities = route?.params?.purities || [
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
  const modelNumber = route?.params?.modelNumber;
  // Weight the rates are shown for (1 gram or 10 gram) — chosen on the
  // Welcome screen and passed in via navigation params. Fixed for this
  // screen; there's no toggle here anymore.
  const gramUnit = route?.params?.gramUnit || 1;

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // What the user has typed into each purity's rate field, keyed by purity.
  // The API-fetched rate is shown only as a placeholder, not a fixed value.
  const [editedRates, setEditedRates] = useState({});
  // Which purity's input is currently focused, so we can hide that field's
  // placeholder as soon as the user taps in (before they've typed anything).
  const [focusedPurity, setFocusedPurity] = useState(null);

  const showDate = purities.includes("Date");
  const showTime = purities.includes("Time");
  // Everything else keeps going to the API exactly as before.
  const goldPurities = purities.filter((p) => p !== "Date" && p !== "Time");

  // Max digits allowed in the rate input: 5 digits for 1 gram, 6 for 10 gram.
const rateMaxLength = gramUnit === 1 ? 5 : 6;

  const loadRates = useCallback(async () => {
    // Check what's already saved locally first. Only purities with no
    // saved value yet (first install, or a purity never set before) get
    // the hardcoded default — no network call is ever made.
    const savedRates = await loadSavedRates(gramUnit);
    const missingPurities = goldPurities.filter((p) => savedRates[p] == null);
    const defaultData = getDefaultRates(missingPurities);

    const merged = goldPurities.map((purity) => {
      if (savedRates[purity] != null) {
        return { purity, ratePerGram: savedRates[purity], currency: "INR" };
      }
      return (
        defaultData.find((r) => r.purity === purity) || {
          purity,
          ratePerGram: 0,
          currency: "INR",
        }
      );
    });

    setRates(merged);
    setLatestRates(merged);
    setLoading(false);
    setRefreshing(false);
  }, [goldPurities.join(","), gramUnit]);

  const handleRateChange = (purity, value) => {
    setEditedRates((prev) => ({ ...prev, [purity]: value }));
  };

  // Commits whatever is currently typed for this purity into `rates`.
  // Called on "done"/submit and on blur (which also fires when the
  // keyboard is dismissed by tapping outside).
  const commitRate = useCallback((purity) => {
    setEditedRates((prev) => {
      const edited = prev[purity];
      if (edited == null || edited.trim().length === 0) return prev;

      const parsed = parseFloat(edited);
      if (!Number.isFinite(parsed)) return prev;

      setRates((prevRates) => {
        const updated = prevRates.map((r) =>
          r.purity === purity ? { ...r, ratePerGram: parsed } : r,
        );
        setLatestRates(updated);
        return updated;
      });
      saveRate(purity, parsed, gramUnit);
      return prev;
    });
  }, [gramUnit]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRates();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={rates}
          keyExtractor={(item) => item.purity}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D4AF37"
            />
          }
          ListHeaderComponent={
            <View>
              <Text style={styles.perGramNote}>
                All rates are for ₹ per {gramUnit} gram
                {gramUnit > 1 ? "s" : ""}
              </Text>
              {modelNumber ? (
                <Text style={styles.modelNumber}>Model: {modelNumber}</Text>
              ) : null}
              {showDate && (
                <DateTimeRow
                  purity="Date"
                  formatter={(d) =>
                    d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  }
                />
              )}
              {showTime && (
                <DateTimeRow
                  purity="Time"
                  formatter={(d) =>
                    d.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  }
                />
              )}
            </View>
          }
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>
                No purities selected. Go back to Welcome to choose.
              </Text>
            )
          }
          renderItem={({ item }) =>{
              const label = item.purity !== "Silver" ? `Gold ${item.purity}` : item.purity;

       
            
            return (
            <View style={styles.card}>
         
              <Text style={styles.purity}>{label}</Text>
          
              <View style={styles.rateInputRow}>
                <Text style={styles.rupeeSign}>₹</Text>
                <View style={styles.rateInputWrapper}>
                  <TextInput
                    style={styles.rateInput}
                    value={editedRates[item.purity] ?? ""}
                    onChangeText={(value) =>
                      handleRateChange(item.purity, value)
                    }
                    onFocus={() => setFocusedPurity(item.purity)}
                    onSubmitEditing={() => commitRate(item.purity)}
                    onBlur={() => {
                      setFocusedPurity(null);
                      commitRate(item.purity);
                    }}
                    returnKeyType="done"
                      maxLength={rateMaxLength}
                    placeholder={
                      focusedPurity === item.purity
                        ? ""
                        : (item.ratePerGram * gramUnit).toLocaleString("en-IN")
                    }
                    placeholderTextColor="#FFFFFF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}
        }
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  purity: { color: "#D4AF37", fontSize: 20, fontWeight: "700" },
  dateTimeValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  rateInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateInputWrapper: {
    backgroundColor: "#111111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333333",
    paddingHorizontal: 10,
  },
  rupeeSign: {
    color: "#D4AF37",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 6,
  },
  rateInput: {
    color: "#FFFFFF",
    fontSize: 16,
    minWidth: 90,
    textAlign: "right",
    paddingVertical: 6,
  },
  perGramNote: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  modelNumber: {
    color: "#AAAAAA",
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#888888",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
});