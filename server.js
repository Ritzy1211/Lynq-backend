const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve frontend from 'public' folder

// Models
const HostApplication = require("./models/HostApplication");

// Admin Middleware
const adminAuth = require("./middleware/adminAuth");

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// POST /apply – Creator Application
app.post("/apply", async (req, res) => {
  try {
    const { fullname, email, bio, social, category } = req.body;

    if (!fullname || !email || !bio || !social || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newApplicant = new HostApplication({
      fullname,
      email,
      bio,
      social,
      category,
      status: "pending", // Optional: track approval status
    });

    await newApplicant.save();
    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error.message);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// GET /admin/applicants – Fetch all applications
app.get("/admin/applicants", adminAuth, async (req, res) => {
  try {
    const applications = await HostApplication.find();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

// PATCH /admin/applicants/:id/approve – Approve a creator
app.patch("/admin/applicants/:id/approve", adminAuth, async (req, res) => {
  try {
    const updated = await HostApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "application not found" });
    }
    res.status(200).json({ message: "Applicant approved", applicant: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve applicant" });
  }
});

// PATCH /admin/applicants/:id/reject – Reject a creator
app.patch("/admin/applicants/:id/reject", adminAuth, async (req, res) => {
  try {
    await HostApplication.findByIdAndUpdate(req.params.id, {
      status: "rejected",
    });
    res.status(200).json({ message: "Applicant rejected" });
  } catch (error) {
    console.error("Rejection error:", error.message);
    res.status(500).json({ message: "Failed to reject applicant" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
