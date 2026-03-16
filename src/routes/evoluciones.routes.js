const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, soloRoles("profesional"), async (req, res) => {
  try {
    const { paciente_id, detalle } = req.body;

    const control = await pool.query(`
      SELECT *
      FROM paciente_profesionales
      WHERE paciente_id = $1 AND profesional_id = $2
    `, [paciente_id, req.usuario.id]);

    if (control.rows.length === 0) {
      return res.status(403).json({ error: "Este paciente no está asignado a este profesional." });
    }

    const areaId = control.rows[0].area_id;

    const result = await pool.query(
      `INSERT INTO evoluciones_clinicas
      (paciente_id, profesional_id, area_id, detalle)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [paciente_id, req.usuario.id, areaId, detalle]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar evolución." });
  }
});

router.get("/paciente/:id", auth, async (req, res) => {
  try {
    if (req.usuario.rol === "tutor") {
      return res.json([]);
    }

    if (req.usuario.rol === "profesional") {
      const result = await pool.query(`
        SELECT e.*, u.nombre_completo AS profesional, a.nombre AS area
        FROM evoluciones_clinicas e
        JOIN usuarios u ON e.profesional_id = u.id
        JOIN areas a ON e.area_id = a.id
        WHERE e.paciente_id = $1 AND e.profesional_id = $2
        ORDER BY e.fecha DESC
      `, [req.params.id, req.usuario.id]);

      return res.json(result.rows);
    }

    const result = await pool.query(`
      SELECT e.*, u.nombre_completo AS profesional, a.nombre AS area
      FROM evoluciones_clinicas e
      JOIN usuarios u ON e.profesional_id = u.id
      JOIN areas a ON e.area_id = a.id
      WHERE e.paciente_id = $1
      ORDER BY e.fecha DESC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener evoluciones." });
  }
});

module.exports = router;