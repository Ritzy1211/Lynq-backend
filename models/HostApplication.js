const mongoose = require("mongoose");

const HostApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  social: String,
  country: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HostApplication", HostApplicationSchema);
