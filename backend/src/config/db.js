const mongoose = require("mongoose");

const connectDB = async () => {
  // If USE_MOCK_DATA is true, skip connecting to Mongo entirely so the
  // API works out of the box without a running database.
  if (process.env.USE_MOCK_DATA === "true") {
    console.log("USE_MOCK_DATA=true -> skipping MongoDB connection, serving mock data.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
