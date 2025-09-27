const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get top 10 users by points
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, points, reputation_score FROM users ORDER BY points DESC LIMIT 10"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
