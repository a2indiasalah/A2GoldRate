// Mock data used while USE_MOCK_DATA=true, or as a fallback if MongoDB
// has no data yet. Rates are illustrative only, not live prices.
const MOCK_RATES = [
  { purity: "24K", ratePerGram: 7350, currency: "INR" },
  { purity: "22K", ratePerGram: 6740, currency: "INR" },
  { purity: "20K", ratePerGram: 6120, currency: "INR" },
  { purity: "18K", ratePerGram: 5510, currency: "INR" },
  { purity: "14K", ratePerGram: 4290, currency: "INR" },
];

function getMockRates() {
  return MOCK_RATES.map((r) => ({
    ...r,
    updatedAt: new Date().toISOString(),
  }));
}

module.exports = { MOCK_RATES, getMockRates };
