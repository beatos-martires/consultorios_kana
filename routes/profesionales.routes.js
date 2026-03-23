const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        p.especialidad_id,
        u.nombre,
        u.dni,
        u.telefono,
        u.email,
        u.activo,
        e.nombre AS especialidad_nombre
      FROM profesionales p
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = p.especialidad_id
      ORDER BY u.nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener profesionales." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.usuario_id,
        p.especialidad_id,
        u.nombre,
        u.dni,
        u.telefono,
        u.email,
        u.activo,
        e.nombre AS especialidad_nombre
      FROM profesionales p
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = p.especialidad_id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesional no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener profesional." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { usuario_id, especialidad_id } = req.body;

    const result = await pool.query(
      `INSERT INTO profesionales (usuario_id, especialidad_id)
       VALUES ($1, $2)
       RETURNING *`,
      [usuario_id, especialidad_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear profesional." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { usuario_id, especialidad_id } = req.body;

    const result = await pool.query(
      `UPDATE profesionales
       SET usuario_id = $1,
           especialidad_id = $2
       WHERE id = $3
       RETURNING *`,
      [usuario_id, especialidad_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profesional no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar profesional." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM profesionales WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el profesional." });
  }
});

module.exports = router;