// Persists the user's "Custom" purity selection (and related Welcome-screen
// choices) across app restarts using AsyncStorage. Kept in its own file so
// screens don't talk to AsyncStorage directly — they just call these helpers.
import AsyncStorage from "@react-native-async-storage/async-storage";

const CUSTOM_PURITIES_KEY = "@gold_rate_app/custom_purities";
const GRAM_UNIT_KEY = "@gold_rate_app/gram_unit";
const MODE_KEY = "@gold_rate_app/mode";
const ADDED_PURITIES_KEY = "@gold_rate_app/added_purities";

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

export async function loadGramUnit(defaultValue = 10) {
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

// --- "Add More" custom purity items --------------------------------------
// Each item is { name, maxDigits } — a purity the user typed in themselves
// on the Add More screen, not one of the predefined ones. Up to 5.

export async function saveAddedPurities(items) {
  try {
    await AsyncStorage.setItem(ADDED_PURITIES_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("saveAddedPurities failed:", err.message);
  }
}

export async function loadAddedPurities() {
  try {
    const raw = await AsyncStorage.getItem(ADDED_PURITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("loadAddedPurities failed:", err.message);
    return [];
  }
}

// --- Clear everything (e.g. for a "reset settings" action) ---------------

export async function clearPuritySettings() {
  try {
    await AsyncStorage.multiRemove([
      CUSTOM_PURITIES_KEY,
      GRAM_UNIT_KEY,
      MODE_KEY,
      ADDED_PURITIES_KEY,
    ]);
  } catch (err) {
    console.warn("clearPuritySettings failed:", err.message);
  }
}

// --- First-launch flag (ad screen shown only once) -----------------------

const HAS_SEEN_AD_KEY = "@gold_rate_app/has_seen_ad";

export async function hasSeenAd() {
  try {
    return (await AsyncStorage.getItem(HAS_SEEN_AD_KEY)) === "true";
  } catch (err) {
    console.warn("hasSeenAd failed:", err.message);
    return false;
  }
}

export async function markAdSeen() {
  try {
    await AsyncStorage.setItem(HAS_SEEN_AD_KEY, "true");
  } catch (err) {
    console.warn("markAdSeen failed:", err.message);
  }
}

// --- Intro screen flag (Get Started button shown only on first open) -----

const HAS_SEEN_INTRO_KEY = "@gold_rate_app/has_seen_intro";

export async function hasSeenIntro() {
  try {
    return (await AsyncStorage.getItem(HAS_SEEN_INTRO_KEY)) === "true";
  } catch (err) {
    console.warn("hasSeenIntro failed:", err.message);
    return false;
  }
}

export async function markIntroSeen() {
  try {
    await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, "true");
  } catch (err) {
    console.warn("markIntroSeen failed:", err.message);
  }
}