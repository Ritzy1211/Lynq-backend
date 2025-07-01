const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const sendConfirmationEmail = require("./utils/sendConfirmationEmail");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Models
const HostApplication = require("./models/HostApplication");
const WaitlistEntry = require("./models/WaitlistEntry");
const adminAuth = require("./middleware/adminAuth");

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// =============== PUBLIC ROUTES ===============

// POST /apply – Creator Application
app.post("/apply", async (req, res) => {
  try {
    const { fullname, email, bio, social, category, referredBy } = req.body;

    if (!fullname || !email || !bio || !social || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const referralCode = crypto.randomBytes(3).toString("hex");

    const newApplicant = new HostApplication({
      fullname,
      email,
      bio,
      social,
      category,
      referralCode,
      referredBy: referredBy || null,
      status: "pending",
    });

    await newApplicant.save();

    await sendConfirmationEmail(email, fullname);

    res.status(200).json({
      message: "Application submitted successfully",
      redirect: "/success.html",
    });
  } catch (error) {
    console.error("Error submitting application:", error.message);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// POST /waitlist – Join Waitlist
app.post("/waitlist", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existing = await WaitlistEntry.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already on the waitlist" });
    }

    const newEntry = new WaitlistEntry({ email });
    await newEntry.save();

    res.status(201).json({ message: "You're on the waitlist!" });
  } catch (err) {
    console.error("Waitlist error:", err.message);
    res.status(500).json({ message: "Failed to join waitlist" });
  }
});

// GET /creators – Fetch Approved Creators
app.get("/creators", async (req, res) => {
  try {
    const approved = await HostApplication.find({ status: "approved" });
    res.status(200).json(approved);
  } catch (err) {
    console.error("Error fetching creators:", err.message);
    res.status(500).json({ message: "Failed to fetch creators" });
  }
});

// GET /creator/:id – View Creator Profile
app.get("/creator/:id", async (req, res) => {
  try {
    const creator = await HostApplication.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!creator) {
      return res
        .status(404)
        .json({ message: "Creator not found or not approved" });
    }

    res.status(200).json(creator);
  } catch (err) {
    console.error("Fetch creator error:", err.message);
    res.status(500).json({ message: "Error loading creator profile" });
  }
});

// =============== ADMIN ROUTES ===============

// GET /admin – Login Page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

// GET /admin-dashboard – Admin Dashboard Page
app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

// GET /admin/applicants – All applicants
app.get("/admin/applicants", adminAuth, async (req, res) => {
  try {
    const applications = await HostApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Fetch error", error: err.message });
  }
});

// PATCH /admin/applicants/:id/approve
app.patch("/admin/applicants/:id/approve", adminAuth, async (req, res) => {
  try {
    const updated = await HostApplication.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Approved", applicant: updated });
  } catch (err) {
    res.status(500).json({ message: "Approve failed", error: err.message });
  }
});

// PATCH /admin/applicants/:id/reject
app.patch("/admin/applicants/:id/reject", adminAuth, async (req, res) => {
  try {
    const updated = await HostApplication.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Rejected", applicant: updated });
  } catch (err) {
    res.status(500).json({ message: "Reject failed", error: err.message });
  }
});

// =============== START SERVER ===============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
