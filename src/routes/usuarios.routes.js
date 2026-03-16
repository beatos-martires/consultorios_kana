const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, a.nombre AS area
      FROM usuarios u
      LEFT JOIN areas a ON u.area_id = a.id
      ORDER BY u.nombre_completo ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar usuarios." });
  }
});

router.get("/:id", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM usuarios
      WHERE id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario." });
  }
});

router.post("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const { nombre_completo, dni, rol, area_id, telefono, email } = req.body;

    const result = await pool.query(
      `INSERT INTO usuarios
      (nombre_completo, dni, rol, area_id, telefono, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [nombre_completo, dni, rol, area_id || null, telefono || null, email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear usuario." });
  }
});

router.put("/:id", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const { nombre_completo, dni, rol, area_id, telefono, email, activo } = req.body;

    const result = await pool.query(`
      UPDATE usuarios
      SET nombre_completo = $1,
          dni = $2,
          rol = $3,
          area_id = $4,
          telefono = $5,
          email = $6,
          activo = $7
      WHERE id = $8
      RETURNING *
    `, [
      nombre_completo,
      dni,
      rol,
      area_id || null,
      telefono || null,
      email || null,
      activo,
      req.params.id
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario." });
  }
});

router.delete("/:id", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el usuario." });
  }
});

module.exports = router;