const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "data", "students.json");

router.get("/", (req, res) => {
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ error: "Can't read data" });
      return;
    }

    try {
      const parsed = JSON.parse(data || "[]");
      res.json(parsed);
    } catch (parseErr) {
      res.status(500).json({ error: "Corrupt data file" });
    }
  });
});

module.exports = router;