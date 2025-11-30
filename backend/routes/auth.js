const express = require("express");
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// NOTE: This is a simple demo implementation. Do NOT use plaintext passwords
// or this code in production. Use a secure user store and hash passwords.

const usersFile = path.join(__dirname, '..', 'data', 'users.json');

async function readUsers() {
  try {
    const raw = await fs.readFile(usersFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    // If file doesn't exist or is invalid, return empty list
    return [];
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  const users = await readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({ success: true, message: "Login successful" });
  }

  // Fallback demo credentials
  if (username === "admin" && password === "password") {
    return res.json({ success: true, message: "Login successful" });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Signup route: creates a new user in backend/data/users.json
router.post('/signup', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const users = await readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  users.push({ username, password });
  try {
    await writeUsers(users);
    return res.status(201).json({ success: true, message: 'Account created' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create account' });
  }
});

module.exports = router;
