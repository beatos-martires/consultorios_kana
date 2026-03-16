const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const {
      paciente_id,
      profesional_id,
      area_id,
      fecha,
      cantidad,
      monto_unitario,
      observaciones
    } = req.body;

    const result = await pool.query(
      `INSERT INTO sesiones
      (paciente_id, profesional_id, area_id, fecha, cantidad, monto_unitario, observaciones, cargado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        paciente_id,
        profesional_id || null,
        area_id,
        fecha,
        cantidad || 1,
        monto_unitario,
        observaciones || null,
        req.usuario.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar sesión." });
  }
});

router.get("/paciente/:id", auth, async (req, res) => {
  try {
    if (req.usuario.rol === "tutor") {
      const control = await pool.query(`
        SELECT *
        FROM paciente_tutores
        WHERE paciente_id = $1 AND tutor_id = $2
      `, [req.params.id, req.usuario.id]);

      if (control.rows.length === 0) {
        return res.status(403).json({ error: "No autorizado." });
      }
    }

    const result = await pool.query(`
      SELECT s.*, a.nombre AS area, u.nombre_completo AS profesional
      FROM sesiones s
      JOIN areas a ON s.area_id = a.id
      LEFT JOIN usuarios u ON s.profesional_id = u.id
      WHERE s.paciente_id = $1
      ORDER BY s.fecha DESC, s.id DESC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener sesiones." });
  }
});

module.exports = router;