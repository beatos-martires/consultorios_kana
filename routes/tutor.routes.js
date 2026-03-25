const express = require("express");
const router = express.Router();
const pool = require("../db/connection"); // o la ruta real de tu conexión

router.get("/pacientes/:tutorId", async (req, res) => {
  const { tutorId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.dni,
        p.fecha_nacimiento,
        p.tutor_usuario_id
      FROM pacientes p
      WHERE p.tutor_usuario_id = $1
      ORDER BY p.nombre
      `,
      [tutorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pacientes del tutor:", error);
    res.status(500).json({ error: "Error al obtener pacientes del tutor" });
  }
});

router.get("/sesiones/:tutorId", async (req, res) => {
  const { tutorId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.paciente_id,
        s.profesional_id,
        s.especialidad_id,
        s.mes,
        s.anio,
        s.cantidad,
        s.precio,
        s.subtotal,
        p.nombre AS paciente_nombre,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM sesiones s
      INNER JOIN pacientes p ON p.id = s.paciente_id
      LEFT JOIN profesionales pr ON pr.id = s.profesional_id
      LEFT JOIN usuarios u ON u.id = pr.usuario_id
      LEFT JOIN especialidades e ON e.id = s.especialidad_id
      WHERE p.tutor_usuario_id = $1
      ORDER BY s.anio DESC, s.mes DESC
      `,
      [tutorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener sesiones del tutor:", error);
    res.status(500).json({ error: "Error al obtener sesiones del tutor" });
  }
});

module.exports = router;