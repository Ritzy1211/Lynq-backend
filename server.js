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
  .catch((err) => console.log ("MongoDB connectiion Error:", err));

// POST /apply route
app.post("/apply", async (req, res) => {
  try {
    const { fullname, email, bio, social, category } = req.body;

    // Optional: validate required fields
    if (!fullname || !email || !bio || !social || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newApplicant = new HostApplication({
      fullname,
      email,
      bio,
      social,
      category,
    });
    await newApplicant.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error.message);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// GET /applications route — get all host applications
app.get("/applications", async (req, res) => {
  try {
    const applications = await HostApplication.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
