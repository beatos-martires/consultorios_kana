const express = require("express");
const pool = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM areas ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener áreas." });
  }
});

module.exports = router;