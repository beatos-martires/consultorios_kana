const express = require("express");
const pool = require("../db/connection");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({ error: "Falta el DNI." });
    }

    const usuarioResult = await pool.query(
      `SELECT * FROM usuarios WHERE dni = $1 AND activo = TRUE LIMIT 1`,
      [dni]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: "No existe un usuario registrado con ese DNI." });
    }

    const usuario = usuarioResult.rows[0];

    if (usuario.rol === "secretaria") {
      return res.json({
        ok: true,
        rol: "secretaria",
        usuario
      });
    }

    if (usuario.rol === "profesional") {
      const profesionalResult = await pool.query(
        `SELECT
           p.id,
           p.usuario_id,
           p.especialidad_id,
           u.nombre,
           u.dni,
           u.telefono,
           u.email,
           e.nombre AS especialidad_nombre
         FROM profesionales p
         JOIN usuarios u ON u.id = p.usuario_id
         JOIN especialidades e ON e.id = p.especialidad_id
         WHERE p.usuario_id = $1
         LIMIT 1`,
        [usuario.id]
      );

      return res.json({
        ok: true,
        rol: "profesional",
        usuario,
        profesional: profesionalResult.rows[0] || null
      });
    }

    if (usuario.rol === "tutor") {
      return res.json({
        ok: true,
        rol: "tutor",
        usuario
      });
    }

    return res.status(400).json({ error: "Rol inválido." });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;