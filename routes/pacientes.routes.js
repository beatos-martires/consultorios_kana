const express = require("express");
const pool = require("../db/connection");
const uploadCud = require("../middlewares/uploadCud");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        u.nombre AS tutor_nombre,
        u.dni AS tutor_dni
      FROM pacientes p
      JOIN usuarios u ON u.id = p.tutor_usuario_id
      ORDER BY p.nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pacientes." });
  }
});

router.get("/tutor/:usuarioId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        u.nombre AS tutor_nombre,
        u.dni AS tutor_dni
      FROM pacientes p
      JOIN usuarios u ON u.id = p.tutor_usuario_id
      WHERE p.tutor_usuario_id = $1
      ORDER BY p.nombre ASC
    `, [req.params.usuarioId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener pacientes del tutor." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        u.nombre AS tutor_nombre,
        u.dni AS tutor_dni
      FROM pacientes p
      JOIN usuarios u ON u.id = p.tutor_usuario_id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener paciente." });
  }
});

router.post("/", uploadCud.single("cud"), async (req, res) => {
  try {
    const { nombre, dni, fecha_nacimiento, tutor_usuario_id } = req.body;
    const archivo = req.file || null;

    const result = await pool.query(
      `INSERT INTO pacientes
       (nombre, dni, fecha_nacimiento, tutor_usuario_id,
        cud_nombre_original, cud_nombre_guardado, cud_ruta, cud_mime, cud_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nombre,
        dni,
        fecha_nacimiento || null,
        tutor_usuario_id,
        archivo ? archivo.originalname : null,
        archivo ? archivo.filename : null,
        archivo ? `/uploads/cud/${archivo.filename}` : null,
        archivo ? archivo.mimetype : null,
        archivo ? archivo.size : null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear paciente." });
  }
});

router.put("/:id", uploadCud.single("cud"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, dni, fecha_nacimiento, tutor_usuario_id } = req.body;

    const actual = await pool.query(
      `SELECT * FROM pacientes WHERE id = $1`,
      [id]
    );

    if (actual.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    const previo = actual.rows[0];
    const archivo = req.file || null;

    const result = await pool.query(
      `UPDATE pacientes
       SET nombre = $1,
           dni = $2,
           fecha_nacimiento = $3,
           tutor_usuario_id = $4,
           cud_nombre_original = $5,
           cud_nombre_guardado = $6,
           cud_ruta = $7,
           cud_mime = $8,
           cud_size = $9
       WHERE id = $10
       RETURNING *`,
      [
        nombre,
        dni,
        fecha_nacimiento || null,
        tutor_usuario_id,
        archivo ? archivo.originalname : previo.cud_nombre_original,
        archivo ? archivo.filename : previo.cud_nombre_guardado,
        archivo ? `/uploads/cud/${archivo.filename}` : previo.cud_ruta,
        archivo ? archivo.mimetype : previo.cud_mime,
        archivo ? archivo.size : previo.cud_size,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar paciente." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM pacientes WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el paciente." });
  }
});

module.exports = router;