const express = require("express");
const multer = require("multer");
const path = require("path");
const expressRouter = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = expressRouter.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/cud");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `cud-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Solo se permiten archivos PDF"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.get("/", auth, async (req, res) => {
  try {
    if (req.usuario.rol === "secretaria") {
      const result = await pool.query(`
        SELECT p.*
        FROM pacientes p
        ORDER BY p.nombre_completo ASC
      `);
      return res.json(result.rows);
    }

    if (req.usuario.rol === "profesional") {
      const result = await pool.query(`
        SELECT DISTINCT p.*
        FROM pacientes p
        JOIN paciente_profesionales pp ON pp.paciente_id = p.id
        WHERE pp.profesional_id = $1
        ORDER BY p.nombre_completo ASC
      `, [req.usuario.id]);
      return res.json(result.rows);
    }

    if (req.usuario.rol === "tutor") {
      const result = await pool.query(`
        SELECT DISTINCT p.*
        FROM pacientes p
        JOIN paciente_tutores pt ON pt.paciente_id = p.id
        WHERE pt.tutor_id = $1
        ORDER BY p.nombre_completo ASC
      `, [req.usuario.id]);
      return res.json(result.rows);
    }

    return res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar pacientes." });
  }
});

router.get("/buscar", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(`
      SELECT *
      FROM pacientes
      WHERE nombre_completo ILIKE $1 OR COALESCE(dni, '') ILIKE $1
      ORDER BY nombre_completo ASC
    `, [`%${q || ""}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en búsqueda de pacientes." });
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

router.get("/profesionales", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre_completo, u.dni, u.area_id, a.nombre AS area
      FROM usuarios u
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.rol = 'profesional' AND u.activo = true
      ORDER BY u.nombre_completo ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener profesionales." });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const paciente = await pool.query(`
      SELECT *
      FROM pacientes
      WHERE id = $1
    `, [req.params.id]);

    if (!paciente.rows.length) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    const tutores = await pool.query(`
      SELECT u.id, u.nombre_completo, u.dni, pt.parentesco
      FROM paciente_tutores pt
      JOIN usuarios u ON u.id = pt.tutor_id
      WHERE pt.paciente_id = $1
    `, [req.params.id]);

    const profesionales = await pool.query(`
      SELECT u.id, u.nombre_completo, u.dni, a.nombre AS area, pp.area_id
      FROM paciente_profesionales pp
      JOIN usuarios u ON u.id = pp.profesional_id
      JOIN areas a ON a.id = pp.area_id
      WHERE pp.paciente_id = $1
    `, [req.params.id]);

    res.json({
      ...paciente.rows[0],
      tutores: tutores.rows,
      profesionales: profesionales.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener detalle del paciente." });
  }
});

router.post("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const {
      nombre_completo,
      dni,
      fecha_nacimiento,
      edad,
      obra_social,
      observaciones,
      tutores,
      profesionales
    } = req.body;

    const pacienteResult = await pool.query(
      `INSERT INTO pacientes
      (nombre_completo, dni, fecha_nacimiento, edad, obra_social, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        nombre_completo,
        dni || null,
        fecha_nacimiento || null,
        edad || null,
        obra_social || null,
        observaciones || null
      ]
    );

    const paciente = pacienteResult.rows[0];

    if (Array.isArray(tutores)) {
      for (const tutor of tutores) {
        await pool.query(
          `INSERT INTO paciente_tutores (paciente_id, tutor_id, parentesco)
           VALUES ($1, $2, $3)`,
          [paciente.id, tutor.tutor_id, tutor.parentesco || null]
        );
      }
    }

    if (Array.isArray(profesionales)) {
      for (const profesional of profesionales) {
        await pool.query(
          `INSERT INTO paciente_profesionales (paciente_id, profesional_id, area_id)
           VALUES ($1, $2, $3)`,
          [paciente.id, profesional.profesional_id, profesional.area_id]
        );
      }
    }

    res.status(201).json(paciente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear paciente." });
  }
});

router.put("/:id", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const {
      nombre_completo,
      dni,
      fecha_nacimiento,
      edad,
      obra_social,
      observaciones,
      cud_tiene,
      cud_vencimiento
    } = req.body;

    const result = await pool.query(`
      UPDATE pacientes
      SET nombre_completo = $1,
          dni = $2,
          fecha_nacimiento = $3,
          edad = $4,
          obra_social = $5,
          observaciones = $6,
          cud_tiene = $7,
          cud_vencimiento = $8
      WHERE id = $9
      RETURNING *
    `, [
      nombre_completo,
      dni || null,
      fecha_nacimiento || null,
      edad || null,
      obra_social || null,
      observaciones || null,
      cud_tiene,
      cud_vencimiento || null,
      req.params.id
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar paciente." });
  }
});

router.delete("/:id", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM pacientes
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    res.json({ mensaje: "Paciente eliminado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo eliminar el paciente." });
  }
});

router.post("/:id/cud", auth, soloRoles("secretaria"), upload.single("cud_pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Debés adjuntar un PDF." });
    }

    const url = `/uploads/cud/${req.file.filename}`;

    const result = await pool.query(`
      UPDATE pacientes
      SET cud_tiene = true,
          cud_pdf_url = $1
      WHERE id = $2
      RETURNING *
    `, [url, req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Error al subir CUD." });
  }
});

module.exports = router;