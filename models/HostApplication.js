const mongoose = require("mongoose");

const hostApplicationSchema = new mongoose.Schema(
  {
    fullname: String,
    email: String,
    bio: String,
    social: String,
    category: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("HostApplication", hostApplicationSchema);
