const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM especialidades ORDER BY nombre ASC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener especialidades." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, precio_sesion } = req.body;

    const result = await pool.query(
      `INSERT INTO especialidades (nombre, precio_sesion)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, precio_sesion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear especialidad." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_sesion } = req.body;

    const result = await pool.query(
      `UPDATE especialidades
       SET nombre = $1, precio_sesion = $2
       WHERE id = $3
       RETURNING *`,
      [nombre, precio_sesion, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar especialidad." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM especialidades WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar la especialidad." });
  }
});

module.exports = router;