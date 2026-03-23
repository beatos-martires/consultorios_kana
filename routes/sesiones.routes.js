const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        pa.nombre AS paciente_nombre,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM sesiones s
      JOIN pacientes pa ON pa.id = s.paciente_id
      JOIN profesionales p ON p.id = s.profesional_id
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = s.especialidad_id
      ORDER BY s.anio DESC, s.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener sesiones." });
  }
});

router.get("/profesional/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        pa.nombre AS paciente_nombre,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM sesiones s
      JOIN pacientes pa ON pa.id = s.paciente_id
      JOIN profesionales p ON p.id = s.profesional_id
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = s.especialidad_id
      WHERE s.profesional_id = $1
      ORDER BY s.anio DESC, s.id DESC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener sesiones del profesional." });
  }
});

router.get("/paciente/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        pa.nombre AS paciente_nombre,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM sesiones s
      JOIN pacientes pa ON pa.id = s.paciente_id
      JOIN profesionales p ON p.id = s.profesional_id
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = s.especialidad_id
      WHERE s.paciente_id = $1
      ORDER BY s.anio DESC, s.id DESC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener sesiones del paciente." });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      paciente_id,
      profesional_id,
      especialidad_id,
      mes,
      anio,
      cantidad,
      precio,
      subtotal
    } = req.body;

    const result = await pool.query(
      `INSERT INTO sesiones
       (paciente_id, profesional_id, especialidad_id, mes, anio, cantidad, precio, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [paciente_id, profesional_id, especialidad_id, mes, anio, cantidad, precio, subtotal]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear sesión." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      paciente_id,
      profesional_id,
      especialidad_id,
      mes,
      anio,
      cantidad,
      precio,
      subtotal
    } = req.body;

    const result = await pool.query(
      `UPDATE sesiones
       SET paciente_id = $1,
           profesional_id = $2,
           especialidad_id = $3,
           mes = $4,
           anio = $5,
           cantidad = $6,
           precio = $7,
           subtotal = $8
       WHERE id = $9
       RETURNING *`,
      [paciente_id, profesional_id, especialidad_id, mes, anio, cantidad, precio, subtotal, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sesión no encontrada." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar sesión." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM sesiones WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar la sesión." });
  }
});

module.exports = router;