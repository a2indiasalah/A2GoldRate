// Persists the user's "Custom" purity selection (and related Welcome-screen
// choices) across app restarts using AsyncStorage. Kept in its own file so
// screens don't talk to AsyncStorage directly — they just call these helpers.
import AsyncStorage from "@react-native-async-storage/async-storage";

const CUSTOM_PURITIES_KEY = "@gold_rate_app/custom_purities";
const GRAM_UNIT_KEY = "@gold_rate_app/gram_unit";
const MODE_KEY = "@gold_rate_app/mode";

// --- Custom purities ----------------------------------------------------

export async function saveCustomPurities(purities) {
  try {
    await AsyncStorage.setItem(CUSTOM_PURITIES_KEY, JSON.stringify(purities));
  } catch (err) {
    console.warn("saveCustomPurities failed:", err.message);
  }
}

export async function loadCustomPurities() {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_PURITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("loadCustomPurities failed:", err.message);
    return [];
  }
}

// --- Gram unit (1g / 10g) -----------------------------------------------

export async function saveGramUnit(gramUnit) {
  try {
    await AsyncStorage.setItem(GRAM_UNIT_KEY, String(gramUnit));
  } catch (err) {
    console.warn("saveGramUnit failed:", err.message);
  }
}

export async function loadGramUnit(defaultValue = 1) {
  try {
    const raw = await AsyncStorage.getItem(GRAM_UNIT_KEY);
    return raw ? Number(raw) : defaultValue;
  } catch (err) {
    console.warn("loadGramUnit failed:", err.message);
    return defaultValue;
  }
}

// --- Mode ("model" | "custom") -------------------------------------------

export async function saveMode(mode) {
  try {
    await AsyncStorage.setItem(MODE_KEY, mode);
  } catch (err) {
    console.warn("saveMode failed:", err.message);
  }
}

export async function loadMode(defaultValue = "model") {
  try {
    const raw = await AsyncStorage.getItem(MODE_KEY);
    return raw || defaultValue;
  } catch (err) {
    console.warn("loadMode failed:", err.message);
    return defaultValue;
  }
}

// --- Clear everything (e.g. for a "reset settings" action) ---------------

export async function clearPuritySettings() {
  try {
    await AsyncStorage.multiRemove([
      CUSTOM_PURITIES_KEY,
      GRAM_UNIT_KEY,
      MODE_KEY,
    ]);
  } catch (err) {
    console.warn("clearPuritySettings failed:", err.message);
  }
}