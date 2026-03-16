const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/paciente/:pacienteId/:anio/:mes", auth, async (req, res) => {
  try {
    const { pacienteId, anio, mes } = req.params;

    if (req.usuario.rol === "tutor") {
      const control = await pool.query(`
        SELECT *
        FROM paciente_tutores
        WHERE paciente_id = $1 AND tutor_id = $2
      `, [pacienteId, req.usuario.id]);

      if (!control.rows.length) {
        return res.status(403).json({ error: "No autorizado para ver este pago." });
      }
    }

    const calculo = await pool.query(
      `SELECT COALESCE(SUM(cantidad * monto_unitario), 0) AS total_mes
       FROM sesiones
       WHERE paciente_id = $1
         AND EXTRACT(YEAR FROM fecha) = $2
         AND EXTRACT(MONTH FROM fecha) = $3`,
      [pacienteId, anio, mes]
    );

    const totalCalculado = Number(calculo.rows[0].total_mes);

    const pago = await pool.query(`
      SELECT *
      FROM pagos_mensuales
      WHERE paciente_id = $1 AND anio = $2 AND mes = $3
    `, [pacienteId, anio, mes]);

    if (!pago.rows.length) {
      return res.json({
        paciente_id: Number(pacienteId),
        anio: Number(anio),
        mes: Number(mes),
        total_calculado: totalCalculado,
        monto_pagado: 0,
        estado: "pendiente",
        observaciones: ""
      });
    }

    res.json({
      ...pago.rows[0],
      total_calculado: totalCalculado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar pago." });
  }
});

router.post("/", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const { paciente_id, anio, mes, monto_pagado, estado, observaciones } = req.body;

    const calculo = await pool.query(
      `SELECT COALESCE(SUM(cantidad * monto_unitario), 0) AS total_mes
       FROM sesiones
       WHERE paciente_id = $1
         AND EXTRACT(YEAR FROM fecha) = $2
         AND EXTRACT(MONTH FROM fecha) = $3`,
      [paciente_id, anio, mes]
    );

    const totalCalculado = Number(calculo.rows[0].total_mes);

    const result = await pool.query(`
      INSERT INTO pagos_mensuales
      (paciente_id, anio, mes, total_calculado, monto_pagado, estado, observaciones)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (paciente_id, anio, mes)
      DO UPDATE SET
        total_calculado = EXCLUDED.total_calculado,
        monto_pagado = EXCLUDED.monto_pagado,
        estado = EXCLUDED.estado,
        observaciones = EXCLUDED.observaciones
      RETURNING *
    `, [
      paciente_id,
      anio,
      mes,
      totalCalculado,
      monto_pagado || 0,
      estado,
      observaciones || null
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar pago mensual." });
  }
});

module.exports = router;

router.get("/historial/:pacienteId", auth, async (req,res)=>{

    const result = await pool.query(`
        SELECT *
        FROM pagos_mensuales
        WHERE paciente_id=$1
        ORDER BY anio DESC, mes DESC
    `,[req.params.pacienteId])

    res.json(result.rows)

})