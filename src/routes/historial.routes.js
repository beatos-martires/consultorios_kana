const express = require("express")
const pool = require("../config/db")
const { auth } = require("../middleware/auth")

const router = express.Router()

router.get("/paciente/:id", auth, async (req,res)=>{

    const sesiones = await pool.query(`
        SELECT s.*,u.nombre_completo as profesional,a.nombre as area
        FROM sesiones s
        LEFT JOIN usuarios u ON u.id=s.profesional_id
        JOIN areas a ON a.id=s.area_id
        WHERE paciente_id=$1
        ORDER BY fecha DESC
    `,[req.params.id])

    res.json(sesiones.rows)

})

module.exports = router