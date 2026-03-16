const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    if (req.usuario.rol === "secretaria") {
      const result = await pool.query(`
        SELECT p.*, a.nombre AS area, u.nombre_completo AS tutor_nombre
        FROM pacientes p
        LEFT JOIN areas a ON p.area_id = a.id
        LEFT JOIN usuarios u ON p.tutor_id = u.id
        ORDER BY p.nombre_completo ASC
      `);
      return res.json(result.rows);
    }

    if (req.usuario.rol === "profesional") {
      const result = await pool.query(`
        SELECT p.*, a.nombre AS area, u.nombre_completo AS tutor_nombre
        FROM pacientes p
        LEFT JOIN areas a ON p.area_id = a.id
        LEFT JOIN usuarios u ON p.tutor_id = u.id
        WHERE p.area_id = $1
        ORDER BY p.nombre_completo ASC
      `, [req.usuario.area_id]);
      return res.json(result.rows);
    }

    if (req.usuario.rol === "tutor") {
      const result = await pool.query(`
        SELECT p.*, a.nombre AS area
        FROM pacientes p
        LEFT JOIN areas a ON p.area_id = a.id
        WHERE p.tutor_id = $1
        ORDER BY p.nombre_completo ASC
      `, [req.usuario.id]);
      return res.json(result.rows);
    }

    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar pacientes." });
  }
});

router.post("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const {
      nombre_completo,
      edad,
      dni,
      obra_social,
      area_id,
      grupo_familiar,
      observaciones,
      tutor_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO pacientes
      (nombre_completo, edad, dni, obra_social, area_id, grupo_familiar, observaciones, tutor_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        nombre_completo,
        edad || null,
        dni || null,
        obra_social || null,
        area_id || null,
        grupo_familiar || null,
        observaciones || null,
        tutor_id || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear paciente." });
  }
});

router.get("/tutores", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre_completo, dni
      FROM usuarios
      WHERE rol = 'tutor' AND activo = true
      ORDER BY nombre_completo ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tutores." });
  }
});

module.exports = router;