const mongoose = require("mongoose");

const GoldRateSchema = new mongoose.Schema(
  {
    purity: {
      type: String, // e.g. "24K", "22K", "20K", "18K", "14K"
      required: true,
      unique: true,
    },
    ratePerGram: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoldRate", GoldRateSchema);
