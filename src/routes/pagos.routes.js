const express = require("express");
const pool = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/paciente/:pacienteId/:anio/:mes", auth, async (req, res) => {
  try {
    const { pacienteId, anio, mes } = req.params;

    if (req.usuario.rol === "tutor") {
      const control = await pool.query(
        "SELECT * FROM pacientes WHERE id = $1 AND tutor_id = $2",
        [pacienteId, req.usuario.id]
      );

      if (control.rows.length === 0) {
        return res.status(403).json({ error: "No autorizado para ver este pago." });
      }
    }

    const result = await pool.query(
      `SELECT COALESCE(SUM(cantidad * monto_unitario), 0) AS total_mes
       FROM sesiones
       WHERE paciente_id = $1
         AND EXTRACT(YEAR FROM fecha) = $2
         AND EXTRACT(MONTH FROM fecha) = $3`,
      [pacienteId, anio, mes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al calcular pago mensual." });
  }
});

module.exports = router;