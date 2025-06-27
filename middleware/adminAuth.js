// middleware/adminAuth.js

require("dotenv").config();

const adminAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  next(); // Allow request to continue
};

module.exports = adminAuth;
