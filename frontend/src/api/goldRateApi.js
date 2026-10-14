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
// Kept as the first N slots for firmware/positional compatibility with
// devices that only ever knew about karat purities + Silver.
const RATE_ORDER = [
  "24CT",
  "22CT",
  "20CT",
  "18CT",
  "14CT",
  "9CT",
  "Silver",
  // These used to be missing from this list, which meant they were
  // silently dropped from the payload even though the user had rates
  // for them on the Home screen (they were in `rates`, just never
  // looked up because buildEspPayload only ever loops over RATE_ORDER).
  "Platinum",
  "Making Charge",
  "Purchase Rate",
  "Exchange Rate",
];

// The rates are sent to the device as 4 line-numbered rows (4 separate
// messages), each starting with "$,<line number>,":
//   row 0: "$,0,DDMMYYYY,HHMMSS"
//   row 1: "$,1,<purity rates 1-10>"
//   row 2: "$,2,<purity rates 11-20>"
//   row 3: "$,3,<purity rates 21-30>"
// The purity list is the standard purities (RATE_ORDER, 10) followed by the
// custom "Add More" purities (up to 20), split evenly into rows of 10.
// Unused slots are sent empty so every field keeps a fixed position.
const ESP_DATA_ROWS = 3;
const ESP_FIELDS_PER_ROW = 10;
const ESP_MAX_CUSTOM = 19;
// Short pause between rows so the ESP can handle one message before the next.
const ESP_ROW_DELAY_MS = 300;

// Shared "DDMMYYYY" / "HHMMSS" formatting, used by both the full rates
// payload and the date-time-only sync payload below.
function formatEspDateTime(when) {
  const pad = (n, len = 2) => String(n).padStart(len, "0");
  const date = `${pad(when.getDate())}${pad(when.getMonth() + 1)}${when.getFullYear()}`;
  const time = `${pad(when.getHours())}${pad(when.getMinutes())}${pad(when.getSeconds())}`;
  return { date, time };
}

// Builds the rates payload as 4 rows (an array of 4 strings), see the
// layout above. `rates` is an array of { purity, ratePerGram } (as returned
// by getDefaultRates or read from AsyncStorage). A purity that is missing,
// not allowed, or has a non-finite rate is sent as an empty slot.
export function buildEspPayloadRows(rates, when = new Date()) {
  const { date, time } = formatEspDateTime(when);

  const ratesByPurity = {};
  const maxDigitsByPurity = {};
  (rates || []).forEach((r) => {
    ratesByPurity[r.purity] = r.ratePerGram;
    maxDigitsByPurity[r.purity] = r.maxDigits;
  });

  const rateFor = (purity) => {
    if (espAllowedPurities && !espAllowedPurities.includes(purity)) return "";
    const value = ratesByPurity[purity];
    if (!Number.isFinite(value)) return "";
    // Left-pad with zeros up to the field's max digits (e.g. 4500 -> "04500")
    const maxDigits = maxDigitsByPurity[purity];
    return maxDigits ? String(value).padStart(maxDigits, "0") : String(value);
  };

  // Custom purities = any name typed on the "Add More Purities" screen,
  // i.e. present in `rates` but not Date/Time and not in the standard list.
  const customPurities = [
    ...new Set(
      (rates || [])
        .map((r) => r.purity)
        .filter((p) => p !== "Date" && p !== "Time" && !RATE_ORDER.includes(p)),
    ),
  ].slice(0, ESP_MAX_CUSTOM);

  // One ordered list of all rate slots: standard purities, then custom ones,
  // padded to 30 and split into 3 rows of 10.
  const slots = [...RATE_ORDER, ...customPurities].map(rateFor);
  const totalSlots = ESP_DATA_ROWS * ESP_FIELDS_PER_ROW;
  while (slots.length < totalSlots) slots.push("");

  const rows = [["$", "0", date, time]];
  for (let i = 0; i < ESP_DATA_ROWS; i++) {
    rows.push([
      "$",
      String(i + 1),
      ...slots.slice(i * ESP_FIELDS_PER_ROW, (i + 1) * ESP_FIELDS_PER_ROW),
    ]);
  }
  return rows.map((row) => row.join(","));
}

// Sends the 4 rows to the device one after another, each as its own GET
// request, e.g. http://192.168.4.1/send?msg=%24%2C20082026%2C101520%2C...
// Stops and throws if any row fails. Returns the 3 payload strings.
export async function sendRatesToDevice(deviceIp, rates, when = new Date()) {
  const rows = buildEspPayloadRows(rates, when);

  for (let i = 0; i < rows.length; i++) {
    const payload = rows[i];
    const url = `http://${deviceIp}/send?msg=${encodeURIComponent(payload)}`;

    console.log(`Sending row ${i + 1}/${rows.length} to ESP ->`, payload);
    console.log("Full request URL ->", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Device responded with status ${response.status} (row ${i + 1})`);
    }
    if (i < rows.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, ESP_ROW_DELAY_MS));
    }
  }
  return rows;
}

// Builds the "$,DDMMYYYY,HHMMSS" payload used by "Sync Device" — just the
// device's clock, no rates.
export function buildEspDateTimePayload(when = new Date()) {
  const { date, time } = formatEspDateTime(when);
  return ["$", date, time].join(",");
}

// Sends just the current date/time to the device, e.g. $,09092026,122230.
// Uses the same /send?msg= endpoint as sendRatesToDevice — adjust if the
// ESP firmware expects a separate route for a clock sync.
export async function sendDateTimeToDevice(deviceIp, when = new Date()) {
  const payload = buildEspDateTimePayload(when);
  const url = `http://${deviceIp}/send?msg=${encodeURIComponent(payload)}`;

  console.log("Syncing date/time to ESP ->", payload);
  console.log("Full request URL ->", url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Device responded with status ${response.status}`);
  }
  return payload;
}