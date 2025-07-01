const mongoose = require("mongoose");

const hostApplicationSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  bio: String,
  social: String,
  category: String,
  status: { type: String, default: "pending" },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null }, // stores the referral code used
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HostApplication", hostApplicationSchema);
