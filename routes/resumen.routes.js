const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.get("/administrativo", async (req, res) => {
  try {
    const { mes, anio } = req.query;

    const filtros = [];
    const valores = [];
    let i = 1;

    if (mes) {
      filtros.push(`s.mes = $${i++}`);
      valores.push(mes);
    }

    if (anio) {
      filtros.push(`s.anio = $${i++}`);
      valores.push(anio);
    }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(s.subtotal), 0) AS total
       FROM sesiones s
       ${where}`,
      valores
    );

    const porEspecialidadResult = await pool.query(
      `SELECT e.nombre, COALESCE(SUM(s.subtotal), 0) AS total
       FROM sesiones s
       JOIN especialidades e ON e.id = s.especialidad_id
       ${where}
       GROUP BY e.nombre
       ORDER BY total DESC`,
      valores
    );

    const porProfesionalResult = await pool.query(
      `SELECT u.nombre, COALESCE(SUM(s.subtotal), 0) AS total
       FROM sesiones s
       JOIN profesionales p ON p.id = s.profesional_id
       JOIN usuarios u ON u.id = p.usuario_id
       ${where}
       GROUP BY u.nombre
       ORDER BY total DESC`,
      valores
    );

    res.json({
      total: totalResult.rows[0].total,
      porEspecialidad: porEspecialidadResult.rows,
      porProfesional: porProfesionalResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen administrativo." });
  }
});

module.exports = router;