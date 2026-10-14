// Persists the rates the USER has typed in for each purity, so the next
// time the app opens it shows their last-entered value instead of falling
// back to the hardcoded/API default. Kept separate per gram unit (1g vs
// 10g) since a rate typed for 10g isn't valid as a 1g rate.
import AsyncStorage from "@react-native-async-storage/async-storage";

const RATES_KEY_PREFIX = "@gold_rate_app/user_rates";

function keyFor(gramUnit) {
  return `${RATES_KEY_PREFIX}:${gramUnit}`;
}

// Saves a single purity's rate, merging with whatever is already stored
// for that gram unit (so updating one purity doesn't wipe the others).
// Saves run one after another: two quick saves (e.g. submit + blur, or
// editing two fields in a row) must not read the same old data and
// overwrite each other's value.
let saveQueue = Promise.resolve();
export function saveRate(purity, ratePerGram, gramUnit) {
  saveQueue = saveQueue.then(() => writeRate(purity, ratePerGram, gramUnit));
  return saveQueue;
}

async function writeRate(purity, ratePerGram, gramUnit) {
  try {
    const existing = await loadSavedRates(gramUnit);
    const updated = { ...existing, [purity]: ratePerGram };
    await AsyncStorage.setItem(keyFor(gramUnit), JSON.stringify(updated));
  } catch (err) {
    console.warn("saveRate failed:", err.message);
  }
}

// Returns a { purity: ratePerGram } map for the given gram unit, or {}
// if nothing has been saved yet (e.g. first install).
export async function loadSavedRates(gramUnit) {
  try {
    const raw = await AsyncStorage.getItem(keyFor(gramUnit));
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("loadSavedRates failed:", err.message);
    return {};
  }
}

// Optional: wipe saved rates for a gram unit (e.g. a "reset to defaults"
// action), so the hardcoded/API rates show again.
export async function clearSavedRates(gramUnit) {
  try {
    await AsyncStorage.removeItem(keyFor(gramUnit));
  } catch (err) {
    console.warn("clearSavedRates failed:", err.message);
  }
}