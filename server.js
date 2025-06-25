const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const HostApplication = require("./models/HostApplication");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// POST /apply route
app.post("/apply", async (req, res) => {
  try {
    const newHost = new HostApplication(req.body);
    await newHost.save();
    res.status(201).json({ message: "Application submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit application." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));