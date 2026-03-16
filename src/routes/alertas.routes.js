const express = require("express")
const pool = require("../config/db")
const { auth, soloRoles } = require("../middleware/auth")

const router = express.Router()

router.get("/", auth, soloRoles("secretaria"), async (req,res)=>{

    const cudVencido = await pool.query(`
        SELECT id,nombre_completo,cud_vencimiento
        FROM pacientes
        WHERE cud_vencimiento IS NOT NULL
        AND cud_vencimiento < CURRENT_DATE
    `)

    const cudPorVencer = await pool.query(`
        SELECT id,nombre_completo,cud_vencimiento
        FROM pacientes
        WHERE cud_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `)

    const pagosPendientes = await pool.query(`
        SELECT p.nombre_completo,pm.anio,pm.mes
        FROM pagos_mensuales pm
        JOIN pacientes p ON p.id = pm.paciente_id
        WHERE estado='pendiente'
    `)

    res.json({
        cud_vencidos: cudVencido.rows,
        cud_por_vencer: cudPorVencer.rows,
        pagos_pendientes: pagosPendientes.rows
    })

})

module.exports = router