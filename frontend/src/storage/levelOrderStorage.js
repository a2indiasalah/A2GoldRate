// Persists the order the user arranged the Home screen's level (purity) rows
// in via "Set Level". This is purely a display order: it is NOT used when
// building the data sent to the device, so the send format never changes.
import AsyncStorage from "@react-native-async-storage/async-storage";

const LEVEL_ORDER_KEY = "@gold_rate_app/level_order";

export async function saveLevelOrder(order) {
  try {
    await AsyncStorage.setItem(LEVEL_ORDER_KEY, JSON.stringify(order));
  } catch (err) {
    console.warn("saveLevelOrder failed:", err.message);
  }
}

// Returns an array of purity names, or null if the user never saved an order.
export async function loadLevelOrder() {
  try {
    const raw = await AsyncStorage.getItem(LEVEL_ORDER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch (err) {
    console.warn("loadLevelOrder failed:", err.message);
    return null;
  }
}

export async function clearLevelOrder() {
  try {
    await AsyncStorage.removeItem(LEVEL_ORDER_KEY);
  } catch (err) {
    console.warn("clearLevelOrder failed:", err.message);
  }
}