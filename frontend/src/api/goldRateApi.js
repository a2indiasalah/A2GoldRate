// Hardcoded starting rates, shown only for a purity that has never been
// set by the user yet (fresh install, or a purity added later that has
// no saved value in AsyncStorage). No network call — this is local data.
const DEFAULT_RATES = [
  { purity: "Date", ratePerGram: 0, currency: "INR" },
  { purity: "Time", ratePerGram: 0, currency: "INR" },
  { purity: "24CT", ratePerGram: 0, currency: "INR" },
  { purity: "22CT", ratePerGram: 0, currency: "INR" },
  { purity: "20CT", ratePerGram: 0, currency: "INR" },
  { purity: "18CT", ratePerGram: 0, currency: "INR" },
  { purity: "14CT", ratePerGram: 0, currency: "INR" },
  { purity: "9CT", ratePerGram: 0, currency: "INR" },
  { purity: "Silver", ratePerGram: 0, currency: "INR" },
];

export function getDefaultRates(purities) {
  return purities && purities.length
    ? DEFAULT_RATES.filter((r) => purities.includes(r.purity))
    : DEFAULT_RATES;
}

// --- Latest rates cache -------------------------------------------------
// HomeScreen keeps this updated with whatever is currently on screen
// (fetched rates + any manual edits). DeviceConnectScreen reads from here
// on "Update Device" instead of re-fetching from the backend — which is
// slow/unreliable there since the phone is on the ESP's own WiFi hotspot
// at that point, not on a network with a route to the backend.
let latestRates = null;

export function setLatestRates(rates) {
  latestRates = Array.isArray(rates) ? rates : null;
}

export function getLatestRates() {
  return latestRates;
}

// --- Which purities the ESP payload should include --------------------
// Tracks the purities the user actually chose on the Welcome screen
// (Model mode = all of them, Custom mode = only the checked ones), so
// buildEspPayload can blank out anything the user didn't select instead
// of sending every fetched rate. null = no restriction (send everything).
let espAllowedPurities = null;

export function setEspAllowedPurities(purities) {
  espAllowedPurities = Array.isArray(purities) ? purities : null;
}

export function getEspAllowedPurities() {
  return espAllowedPurities;
}

// --- Device (ESP) update ---------------------------------------------

// Fixed purity order the ESP display expects, matching the Welcome screen's
// purity list (minus "Date"/"Time", which are generated locally below).
const RATE_ORDER = ["24CT", "22CT", "20CT", "18CT", "14CT", "9CT", "Silver"];

// Builds the "$,DDMMYYYY,HHMMSS,<rate>,<rate>,...," payload.
// `rates` is an array of { purity, ratePerGram } (as returned by
// getDefaultRates or read from AsyncStorage). Any purity missing from that array, or with a
// non-finite rate, is sent as an empty slot between commas.
export function buildEspPayload(rates, when = new Date()) {
  const pad = (n, len = 2) => String(n).padStart(len, "0");

  const date = `${pad(when.getDate())}${pad(when.getMonth() + 1)}${when.getFullYear()}`;
  const time = `${pad(when.getHours())}${pad(when.getMinutes())}${pad(when.getSeconds())}`;

  const ratesByPurity = {};
  (rates || []).forEach((r) => {
    ratesByPurity[r.purity] = r.ratePerGram;
  });

  const rateFields = RATE_ORDER.map((purity) => {
    if (espAllowedPurities && !espAllowedPurities.includes(purity)) return "";
    const value = ratesByPurity[purity];
    return Number.isFinite(value) ? String(value) : "";
  });

  // Comma-joining naturally leaves a trailing "," whenever the last field
  // (Silver) is empty, matching the sample payload's format.
  return ["$", date, time, ...rateFields].join(",");
}

// Sends the payload to the device as a GET request, e.g.
// http://192.168.4.1/send?data=%24%2C20082026%2C101520%2C...
// Adjust the query param name below ("data") if the ESP firmware expects
// a different one.
export async function sendRatesToDevice(deviceIp, rates, when = new Date()) {
  const payload = buildEspPayload(rates, when);
  const url = `http://${deviceIp}/send?msg=${encodeURIComponent(payload)}`;

  console.log("Sending to ESP ->", payload);
  console.log("Full request URL ->", url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Device responded with status ${response.status}`);
  }
  return payload;
}