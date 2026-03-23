const express = require("express");
const pool = require("../db/connection");
const uploadInforme = require("../middlewares/upload-informe");

const router = express.Router();

router.get("/paciente/:pacienteId", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.*,
        u.nombre AS profesional_nombre,
        e.nombre AS especialidad_nombre
      FROM informes i
      JOIN profesionales p ON p.id = i.profesional_id
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN especialidades e ON e.id = p.especialidad_id
      WHERE i.paciente_id = $1
      ORDER BY i.fecha DESC
    `, [req.params.pacienteId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener informes." });
  }
});

router.post("/", uploadInforme.single("informe"), async (req, res) => {
  try {
    const { paciente_id, profesional_id } = req.body;
    const archivo = req.file;

    if (!archivo) {
      return res.status(400).json({ error: "Debés adjuntar un PDF." });
    }

    const result = await pool.query(
      `INSERT INTO informes
       (paciente_id, profesional_id, nombre_original, nombre_guardado, ruta, mime, size)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        paciente_id,
        profesional_id,
        archivo.originalname,
        archivo.filename,
        `/uploads/informes/${archivo.filename}`,
        archivo.mimetype,
        archivo.size
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar informe." });
  }
});

module.exports = router;