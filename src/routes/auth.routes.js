const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({ error: "Debés ingresar el DNI." });
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE dni = $1 AND activo = true",
      [dni]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "DNI no registrado." });
    }

    const usuario = result.rows[0];

    const token = jwt.sign(
      {
        id: usuario.id,
        dni: usuario.dni,
        rol: usuario.rol,
        area_id: usuario.area_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        dni: usuario.dni,
        rol: usuario.rol,
        area_id: usuario.area_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno en login." });
  }
});

module.exports = router;