// Maps each device model number to the set of purities that model's
// Home screen should display. Edit this table to match your real 10
// models — add/remove purities per model as needed.
//
// Keep model numbers in UPPERCASE here; lookups are case-insensitive
// and trim whitespace, so "grd-2100", " GRD-2100 " etc. all match.
export const MODEL_PURITY_MAP = {
    "A2GM0": ["22CT", "Silver"],
    "A2GM1": ["22CT", "18CT"],
    "A2GM2": ["22CT", "18CT", "Silver"],
    "A2GM3": ["22CT", "18CT", "Silver"],
    "A2GM5": ["24CT", "22CT", "18CT", "Silver"],
    "A2GM6": ["Date", "Time", "22CT", "Silver"],
    "A2GM7": ["Date", "Time", "22CT", "Silver"],
    "A2GM8": ["Date", "Time","22CT",  "18CT", "Silver"],
    "A2GM9": ["Date", "Time","22CT",  "18CT", "Silver"],
    "A2GM10": ["Date", "Time", "24CT", "22CT",  "18CT", "Silver"],
    "A2GM11":  ["Date", "Time", "24CT", "22CT",  "18CT", "Silver"],
    
    "A2GM12V": [  "24CT", "22CT",  "18CT", "Silver"],
    "A2GM13V": ["Date", "Time", "24CT", "22CT",  "18CT", "Silver"],
    "A2GM14V": ["Date"],
    "A2GM16V": ["24CT", "22CT",  "18CT"],
    "A2GM18":  ["Date", "Time", "24CT", "22CT",  "Silver"],
    "A2GM19": ["Date"],
    "A2GM20": ["Date", "Time", "24CT", "22CT", "18CT", "Silver"],
    "A2GM21":["Date", "Time", "24CT", "22CT", "Silver"],
    "A2GM22": ["Date", "Time", "24CT", "22CT", "20CT", "Silver"],
    "A2GM23": ["Date", "Time", "22CT", "18CT", "Silver"],
    "A2GM24":  ["Date", "24CT", "22CT", "18CT", "14CT", "Silver"],
    "A2GM25": ["22CT", "Silver"],
    "A2GM26": ["24CT", "22CT", "18CT", "14CT", "Silver"],
    "A2GM27": ["Date","Time", "24CT", "22CT","20CT", "18CT", "Silver"],
    "A2GM28": ["Date", "Time", "24CT", "22CT", "20CT", "18CT", "Silver"],
    "A2GM29": ["Date","Time",  "22CT", "18CT",  "Silver"],
    "A2GM30":[ "24CT","22CT", "18CT",  "Silver"],
    "A2GM31": ["Date","24CT",  "22CT", "Silver"],
    "A2GM32": ["Date", "24CT", "22CT", "18CT", "Silver"],
    "A2GM33": ["Date","Time", "24CT", "22CT","20CT", "18CT"],
    "A2GM34": ["Date","Time", "24CT", "22CT","20CT", "18CT", "Silver"],
    "A2GM35H": ["Date", "Time", "22CT", "Silver"],
    "A2GM36": ["Date","Time","24CT", "22CT","18CT", "Silver"],
    "A2GM37": ["Date", "22CT","18CT", "Silver"],
    "A2GM38":  ["Date","Time", "24CT", "22CT", "20CT", "Silver"],
    "A2GM39": ["Date", "24CT", "22CT", "18CT", "14CT", "Silver"],
    "A2GM40":["Date","Time", "22CT", "18CT", "Silver"],
    "A2GM41": ["Date", "Time", "24CT", "22CT", "18CT", "Silver"],
    "A2GM42": ["Date", "24CT", "22CT", "20CT", "18CT", "Silver"],
    "A2GM43": ["Date", "Time", "22CT", "Silver"],
    "A2GM44": [ "22CT", "18CT", "Silver"],
    "A2GM45": [ "24CT","22CT", "18CT", "Silver"],
    "A2GM46": ["22CT", "18CT", "Silver"],
    "A2GM47": ["Date", "Time", "22CT", "18CT", "Silver"],
    "A2GM48": [ "22CT",  "18CT", "14CT", "9CT", "Silver"],
    "A2GM49": ["Date", "Time", "22CT", "18CT", "14CT", "9CT", "Silver"],
    "A2GM50": [ "22CT", "18CT", "14CT", "9CT"],
    "A2GM51": ["Date", "Time", "22CT", "18CT", "Silver"],
    "A2GM52":["Date", "24CT", "22CT", "18CT", "14CT", "9CT", "Silver"],
    "A2GM53": ["24CT", "22CT", "18CT", "14CT", "9CT", "Silver"],
    "A2GM54": ["Date", "Time", "24CT", "22CT", "18CT", "Silver"],
   
};

// Looks up the purity list for a model number the user typed.
// Returns null if the model isn't in the table (caller decides what
// to do — e.g. show an error instead of silently using a default).
export function getPuritiesForModel(modelNumber) {
    if (!modelNumber) return null;
    const key = modelNumber.trim().toUpperCase();
    return MODEL_PURITY_MAP[key] || null;
}