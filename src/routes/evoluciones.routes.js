const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, soloRoles("profesional"), async (req, res) => {
  try {
    const { paciente_id, detalle } = req.body;

    const paciente = await pool.query(
      "SELECT * FROM pacientes WHERE id = $1 AND area_id = $2",
      [paciente_id, req.usuario.area_id]
    );

    if (paciente.rows.length === 0) {
      return res.status(403).json({ error: "No podés cargar evolución para este paciente." });
    }

    const result = await pool.query(
      `INSERT INTO evoluciones_clinicas
      (paciente_id, profesional_id, detalle)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [paciente_id, req.usuario.id, detalle]
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

    const result = await pool.query(`
      SELECT e.*, u.nombre_completo AS profesional
      FROM evoluciones_clinicas e
      JOIN usuarios u ON e.profesional_id = u.id
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