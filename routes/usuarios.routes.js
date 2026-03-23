const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM usuarios ORDER BY nombre ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

router.get("/rol/:rol", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM usuarios
       WHERE rol = $1
       ORDER BY nombre ASC`,
      [req.params.rol]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios por rol." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, dni, rol, telefono, email, activo } = req.body;

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, dni, rol, telefono, email, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, dni, rol, telefono || null, email || null, activo ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuario." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombre, dni, rol, telefono, email, activo } = req.body;

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1,
           dni = $2,
           rol = $3,
           telefono = $4,
           email = $5,
           activo = $6
       WHERE id = $7
       RETURNING *`,
      [nombre, dni, rol, telefono || null, email || null, activo, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM usuarios WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el usuario." });
  }
});

module.exports = router;