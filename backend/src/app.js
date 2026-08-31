const express = require("express");
const cors = require("cors");
const goldRateRoutes = require("./routes/goldRate.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Gold Rate API is running" });
});

app.use("/api/gold-rate", goldRateRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
