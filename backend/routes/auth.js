const express = require("express");
const router = express.Router();

// Simple demo authentication.
// In production, replace with secure user store and hashed passwords.
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  // Demo credentials
  if (username === "admin" && password === "password") {
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

module.exports = router;
