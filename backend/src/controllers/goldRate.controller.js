const GoldRate = require("../models/GoldRate");
const { getMockRates } = require("../constants/mockRates");

// GET /api/gold-rate  -> all purities
// GET /api/gold-rate?purities=24K,22K -> filtered subset (used by Custom mode)
async function getGoldRates(req, res) {
  const { purities } = req.query;
  const requested = purities
    ? purities.split(",").map((p) => p.trim().toUpperCase())
    : null;

  let rates;

  if (process.env.USE_MOCK_DATA === "true") {
    rates = getMockRates();
  } else {
    rates = await GoldRate.find({});
    if (!rates || rates.length === 0) {
      // Fallback to mock data if DB is empty (e.g. first run)
      rates = getMockRates();
    }
  }

  if (requested) {
    rates = rates.filter((r) => requested.includes(r.purity));
  }

  res.json({ success: true, data: rates });
}

module.exports = { getGoldRates };
