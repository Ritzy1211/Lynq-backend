// test-email.js
require("dotenv").config(); // Load environment variables

const sendConfirmationEmail = require("./utils/sendConfirmationEmail");

// Replace with your test email and name
const testEmail = "youremail@example.com";
const testName = "Tester";

sendConfirmationEmail(testEmail, testName)
  .then(() => {
    console.log("✅ Email sent successfully");
  })
  .catch((err) => {
    console.error("❌ Email send error:", err.message);
  });
