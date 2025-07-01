const mongoose = require("mongoose");

const WaitlistEntrySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WaitlistEntry", WaitlistEntrySchema);