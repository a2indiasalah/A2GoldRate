import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getDefaultRates,
  setLatestRates,
  sendRatesToDevice,
} from "../api/goldRateApi";
import { ESP_HOTSPOT_IP } from "../wifi/espHotspot";
import { useDeviceConnection } from "../context/DeviceConnectionContext";
import { loadSavedRates, saveRate } from "../storage/rateStorage";
import { getAllPurities, isGoldKarat } from "../constants/modelPurities";
import DraggableLevelList from "../components/DraggableLevelList";
import { useLevelEdit } from "../context/LevelEditContext";
import {
  loadLevelOrder,
  saveLevelOrder,
  clearLevelOrder,
} from "../storage/levelOrderStorage";

// Puts `keys` (default order) into the user's saved order. Anything not in
// the saved order (e.g. a newly added purity) goes to the end.
function applyLevelOrder(keys, saved) {
  if (!saved || !saved.length) return keys;
  const known = saved.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !known.includes(k));
  return [...known, ...rest];
}

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
  // Always-current copies, so a typed value (including 0) is applied
  // immediately instead of waiting for the field to lose focus.
  const ratesRef = useRef(rates);
  ratesRef.current = rates;
  const editedRef = useRef({});
  const getMaxDigitsRef = useRef((p) => 0);
  // Which purity's input is currently focused, so we can hide that field's
  // placeholder as soon as the user taps in (before they've typed anything).
  const [focusedPurity, setFocusedPurity] = useState(null);
  // Send button only shows while the phone is connected to the device.
  const { isConnected } = useDeviceConnection();
  const [sending, setSending] = useState(false);

  // --- "Set Level" (reorder rows) ------------------------------------
  // UI order only. `rates` keeps its original order because the device
  // payload is built from it; only what is drawn on screen is reordered.
  const { levelEditMode, setLevelEditMode } = useLevelEdit();
  const [levelOrder, setLevelOrder] = useState(null); // saved order
  const [draftOrder, setDraftOrder] = useState([]); // order while editing

  useEffect(() => {
    loadLevelOrder().then(setLevelOrder);
  }, []);

  const orderedRates = useMemo(() => {
    const byKey = {};
    rates.forEach((r) => {
      byKey[r.purity] = r;
    });
    return applyLevelOrder(
      rates.map((r) => r.purity),
      levelOrder,
    ).map((k) => byKey[k]);
  }, [rates, levelOrder]);

  // Entering Set Level: start from what is currently shown.
  useEffect(() => {
    if (levelEditMode) {
      Keyboard.dismiss();
      setDraftOrder(orderedRates.map((r) => r.purity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelEditMode]);

  const handleSaveLevel = () => {
    setLevelOrder(draftOrder);
    saveLevelOrder(draftOrder);
    setLevelEditMode(false);
  };

  const handleResetLevel = () => {
    setLevelOrder(null);
    clearLevelOrder();
    setDraftOrder(rates.map((r) => r.purity));
  };

  // Keyboard handling: on Android 15+/edge-to-edge builds the window no
  // longer resizes when the keyboard opens, so the keyboard just covers
  // the bottom of the list. We track its height, pad the list by that
  // much, and scroll the focused field into view.
  const listRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates?.height || 0),
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Where the focused input lands in the visible list: 0 = very top,
  // 0.5 = middle. Lower = input sits higher = bigger gap above the keyboard.
  const FOCUS_VIEW_POSITION = 0.5;
  // Extra scroll room added under the list while the keyboard is open, so
  // even the last fields can be scrolled up to that position.
  const KEYBOARD_EXTRA_SPACE = 250;

  const scrollToPurity = useCallback(
    (purity) => {
      const index = orderedRates.findIndex((r) => r.purity === purity);
      if (index < 0) return;
      // Small delay so the extra bottom padding has been applied first.
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: FOCUS_VIEW_POSITION,
        });
      }, 150);
    },
    [orderedRates],
  );

  // Scroll the focused field into view only once the keyboard is actually
  // open. Doing it inside onFocus was too early on the first tap: the
  // keyboard hadn't appeared yet, so keyboardHeight was still 0 and the
  // extra bottom padding wasn't applied, so the list couldn't scroll far
  // enough. (From the second tap the keyboard was already open, so it
  // worked.) This effect re-runs when the keyboard opens and when focus
  // moves to a different field.
  useEffect(() => {
    if (keyboardHeight > 0 && focusedPurity) {
      scrollToPurity(focusedPurity);
    }
  }, [keyboardHeight, focusedPurity, scrollToPurity]);

  const showDate = purities.includes("Date");
  const showTime = purities.includes("Time");
  // Everything else keeps going to the API exactly as before — known
  // purities (Model/Custom checkboxes) are shown in the same fixed
  // order as the master purity list, just skipping whichever ones
  // weren't selected. Anything the user typed in on the Add More
  // screen isn't part of that master list, so it's appended after —
  // in whatever order it was added — instead of being dropped.
  const knownOrder = getAllPurities();
  const selectedKnown = knownOrder.filter(
    (p) => purities.includes(p) && p !== "Date" && p !== "Time",
  );
  const addedCustom = purities.filter(
    (p) => p !== "Date" && p !== "Time" && !knownOrder.includes(p),
  );
  const goldPurities = [...selectedKnown, ...addedCustom];

  // Per-purity max digits for anything added via the Add More screen
  // (e.g. { Wastage: 3 }). Falls back to rateMaxLength below for every
  // predefined purity, which isn't in this map.
  const customDigits = route?.params?.customDigits || {};

  // Max digits allowed in the rate input: 5 digits for 1 gram, 6 for 10 gram.
const rateMaxLength = gramUnit === 1 ? 5 : 6;

  // Silver is always 4 digits; other purities use 5 (1 gram) or 6 (10 gram).
  const getMaxDigits = (purity) =>
    customDigits[purity] ?? (purity === "Silver" ? 4 : rateMaxLength);
  getMaxDigitsRef.current = getMaxDigits;

  // The width a rate is zero-padded to when sent (e.g. 314 -> "000314" for
  // a 6-digit field) is stored on each rate as `maxDigits`. Keep it in step
  // with the field's current max length, so the padding on the wire can
  // never differ from what the input box allows.
  useEffect(() => {
    const current = ratesRef.current;
    if (!current.length) return;
    const restamped = current.map((r) => ({
      ...r,
      maxDigits: getMaxDigits(r.purity),
    }));
    if (restamped.some((r, i) => r.maxDigits !== current[i].maxDigits)) {
      ratesRef.current = restamped;
      setRates(restamped);
      setLatestRates(restamped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gramUnit, JSON.stringify(customDigits), rates.length]);

  const loadRates = useCallback(async () => {
    // Check what's already saved locally first. Only purities with no
    // saved value yet (first install, or a purity never set before) get
    // the hardcoded default — no network call is ever made.
    const savedRates = await loadSavedRates(gramUnit);
    const missingPurities = goldPurities.filter((p) => savedRates[p] == null);
    const defaultData = getDefaultRates(missingPurities);

    const merged = goldPurities.map((purity) => {
      // maxDigits = width this field is padded to when sent to the device.
      const maxDigits = getMaxDigits(purity);
      if (savedRates[purity] != null) {
        return {
          purity,
          ratePerGram: savedRates[purity],
          currency: "INR",
          maxDigits,
        };
      }
      return {
        ...(defaultData.find((r) => r.purity === purity) || {
          purity,
          ratePerGram: 0,
          currency: "INR",
        }),
        maxDigits,
      };
    });

    setRates(merged);
    setLatestRates(merged);
    setLoading(false);
    setRefreshing(false);
  }, [goldPurities.join(","), gramUnit, JSON.stringify(customDigits)]);

  // Writes one purity's value into `rates`, the module copy used by the
  // "Update Display" button on the Device tab, and storage.
  const applyRate = useCallback(
    (purity, parsed) => {
      const updated = ratesRef.current.map((r) => {
        const base = { ...r, maxDigits: getMaxDigitsRef.current(r.purity) };
        return r.purity === purity ? { ...base, ratePerGram: parsed } : base;
      });
      ratesRef.current = updated;
      setRates(updated);
      setLatestRates(updated);
      saveRate(purity, parsed, gramUnit);
    },
    [gramUnit],
  );

  const parseTyped = (text) => {
    if (text == null) return NaN;
    // Empty box = 0 (instead of keeping the old rate)
    return text.trim().length === 0 ? 0 : parseFloat(text);
  };

  const handleRateChange = (purity, value) => {
    // Drop leading zeros as soon as a digit is typed (so "0" + "5" -> "5").
    // A lone "0" is kept.
    const cleaned = value.replace(/^0+(?=\d)/, "");
    editedRef.current = { ...editedRef.current, [purity]: cleaned };
    setEditedRates((prev) => ({ ...prev, [purity]: cleaned }));

    // Apply right away (also for 0 / empty) so every send path sees it.
    const parsed = parseTyped(cleaned);
    if (Number.isFinite(parsed)) applyRate(purity, parsed);
  };

  // Called on "done"/submit and on blur: tidies what is shown in the box.
  const commitRate = useCallback(
    (purity) => {
      const parsed = parseTyped(editedRef.current[purity]);
      if (!Number.isFinite(parsed)) return;
      applyRate(purity, parsed);
      // Show the plain number (no leading zeros) — padding is only added
      // when the value is sent to the device.
      editedRef.current = { ...editedRef.current, [purity]: String(parsed) };
      setEditedRates((prev) => ({ ...prev, [purity]: String(parsed) }));
    },
    [applyRate],
  );

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  // Sends every rate currently on screen to the device. Anything typed
  // but not yet committed (keyboard still open) is included too.
  const handleSendToDevice = async () => {
    const current = rates.map((r) => {
      const raw = editedRates[r.purity];
      const typed = raw != null && raw.trim() === "" ? 0 : parseFloat(raw);
      const base = { ...r, maxDigits: getMaxDigits(r.purity) };
      return Number.isFinite(typed) ? { ...base, ratePerGram: typed } : base;
    });

    if (current.length === 0) {
      Alert.alert("No rates", "There are no rates to send.");
      return;
    }

    setSending(true);
    try {
      setLatestRates(current);
      await sendRatesToDevice(ESP_HOTSPOT_IP, current);
      Alert.alert("Sent", "All rates have been sent to the device.");
    } catch (err) {
      Alert.alert(
        "Send failed",
        err?.message ||
          "Could not send rates. Make sure the device is powered on and in range.",
      );
    } finally {
      setSending(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRates();
  };

  const listHeader = (
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
  );

  // Rows shown in Set Level mode (read-only; drag to reorder).
  const levelItems = rates.map((r) => ({
    key: r.purity,
    label: isGoldKarat(r.purity) ? `Gold ${r.purity}` : r.purity,
    valueText: `₹ ${editedRates[r.purity] ?? r.ratePerGram}`,
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {levelEditMode ? (
        <View style={{ flex: 1 }}>
          <DraggableLevelList
            header={listHeader}
            footer={
              <View style={styles.levelButtonsRow}>
                <TouchableOpacity
                  style={styles.levelResetBtn}
                  onPress={handleResetLevel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelResetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.levelSaveBtn}
                  onPress={handleSaveLevel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            }
            items={levelItems}
            order={draftOrder}
            onOrderChange={setDraftOrder}
          />
        </View>
      ) : (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
      <FlatList
        ref={listRef}
        contentContainerStyle={[
          styles.listContent,
          keyboardHeight > 0 && { paddingBottom: 90 + KEYBOARD_EXTRA_SPACE },
        ]}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        data={orderedRates}
        keyExtractor={(item) => item.purity}
        keyboardShouldPersistTaps="handled"
        // Dismisses the keyboard as soon as the user starts scrolling —
        // same end result as the old "tap anywhere to dismiss" behavior,
        // but without wrapping the FlatList in a TouchableWithoutFeedback.
        // That wrapper was fighting with the FlatList's own touch/scroll
        // responder, which is why scrolling worked in some spots and not
        // others once the purity list got long enough to overflow.
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
          />
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              No purities selected. Go back to Welcome to choose.
            </Text>
          )
        }
        renderItem={({ item }) =>{
            const label = isGoldKarat(item.purity)
              ? `Gold ${item.purity}`
              : item.purity;

     
          
          return (
          <View style={styles.card}>
       
            <Text style={styles.purity}>{label}</Text>
        
            <View style={styles.rateInputRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <View style={styles.rateInputWrapper}>
                <TextInput
                  style={styles.rateInput}
                  value={
                    editedRates[item.purity] ?? String(item.ratePerGram)
                  }
                  onChangeText={(value) =>
                    handleRateChange(item.purity, value)
                  }
                  onFocus={() => {
                    setFocusedPurity(item.purity);
                  }}
                  onSubmitEditing={() => commitRate(item.purity)}
                  onBlur={() => {
                    setFocusedPurity(null);
                    commitRate(item.purity);
                  }}
                  returnKeyType="done"
                    maxLength={getMaxDigits(item.purity)}
                  placeholder={focusedPurity === item.purity ? "" : "0"}
                  placeholderTextColor="#FFFFFF"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}
      }
      />
      </KeyboardAvoidingView>
      )}
      {isConnected && keyboardHeight === 0 && !levelEditMode && (
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendToDevice}
          disabled={sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator color="#111111" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#111111" />
              <Text style={styles.sendButtonText}>Send</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  listContent: { padding: 16, paddingBottom: 90 },
  sendButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 6,
    minWidth: 110,
  },
  sendButtonDisabled: { opacity: 0.6 },
  sendButtonText: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
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
  levelBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1C1C1C",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  levelBarTitle: { color: "#D4AF37", fontSize: 18, fontWeight: "700" },
  levelBarHint: { color: "#AAAAAA", fontSize: 12, marginTop: 2 },
  levelButtonsRow: { flexDirection: "row", marginTop: 8 },
  levelResetBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D4AF37",
    marginRight: 6,
  },
  levelResetText: { color: "#D4AF37", fontSize: 17, fontWeight: "700" },
  levelSaveBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#D4AF37",
    marginLeft: 6,
  },
  levelSaveText: { color: "#111111", fontSize: 17, fontWeight: "700" },
  emptyText: {
    color: "#888888",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
});