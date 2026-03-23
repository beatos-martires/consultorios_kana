const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/paciente/:pacienteId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.*,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM observaciones o
      JOIN profesionales p ON p.id = o.profesional_id
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = p.especialidad_id
      WHERE o.paciente_id = $1
      ORDER BY o.fecha DESC
    `, [req.params.pacienteId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener observaciones." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { paciente_id, profesional_id, observacion } = req.body;

    const result = await pool.query(
      `INSERT INTO observaciones (paciente_id, profesional_id, observacion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [paciente_id, profesional_id, observacion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar observación." });
  }
});

module.exports = router;