const express = require("express");
const pool = require("../config/db");
const { auth, soloRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const pacientes = await pool.query("SELECT COUNT(*) AS total FROM pacientes");
    const usuarios = await pool.query("SELECT COUNT(*) AS total FROM usuarios WHERE activo = true");
    const sesiones = await pool.query("SELECT COUNT(*) AS total FROM sesiones");
    const pagosPendientes = await pool.query(`
      SELECT COUNT(*) AS total
      FROM pagos_mensuales
      WHERE estado = 'pendiente'
    `);

    res.json({
      pacientes: Number(pacientes.rows[0].total),
      usuarios: Number(usuarios.rows[0].total),
      sesiones: Number(sesiones.rows[0].total),
      pagos_pendientes: Number(pagosPendientes.rows[0].total)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar dashboard." });
  }
});

router.get("/mensual-por-area", auth, soloRoles("secretaria"), async (req, res) => {
  try {
    const { anio, mes, desde, hasta } = req.query;

    let query = `
      SELECT a.nombre AS area,
             COUNT(s.id) AS total_sesiones,
             COALESCE(SUM(s.cantidad * s.monto_unitario), 0) AS total_facturado
      FROM sesiones s
      JOIN areas a ON s.area_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let index = 1;

    if (anio) {
      query += ` AND EXTRACT(YEAR FROM s.fecha) = $${index++}`;
      params.push(anio);
    }

    if (mes) {
      query += ` AND EXTRACT(MONTH FROM s.fecha) = $${index++}`;
      params.push(mes);
    }

    if (desde) {
      query += ` AND s.fecha >= $${index++}`;
      params.push(desde);
    }

    if (hasta) {
      query += ` AND s.fecha <= $${index++}`;
      params.push(hasta);
    }

    query += `
      GROUP BY a.nombre
      ORDER BY a.nombre ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar reporte." });
  }
});

module.exports = router;

const ExcelJS = require("exceljs")

router.get("/excel", auth, soloRoles("secretaria"), async (req,res)=>{

    const result = await pool.query(`
        SELECT a.nombre as area,
        COUNT(s.id) as sesiones,
        SUM(s.cantidad*s.monto_unitario) as total
        FROM sesiones s
        JOIN areas a ON s.area_id=a.id
        GROUP BY a.nombre
    `)

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet("Reporte")

    sheet.columns = [
        {header:"Área", key:"area"},
        {header:"Sesiones", key:"sesiones"},
        {header:"Total Facturado", key:"total"}
    ]

    result.rows.forEach(r=>sheet.addRow(r))

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte.xlsx"
    )

    await workbook.xlsx.write(res)
    res.end()

})

const PDFDocument = require("pdfkit")

router.get("/pdf", auth, soloRoles("secretaria"), async (req,res)=>{

    const result = await pool.query(`
        SELECT a.nombre as area,
        COUNT(s.id) as sesiones,
        SUM(s.cantidad*s.monto_unitario) as total
        FROM sesiones s
        JOIN areas a ON s.area_id=a.id
        GROUP BY a.nombre
    `)

    const doc = new PDFDocument()

    res.setHeader("Content-Type","application/pdf")
    res.setHeader("Content-Disposition","attachment; filename=reporte.pdf")

    doc.pipe(res)

    doc.fontSize(18).text("Reporte de facturación por área")
    doc.moveDown()

    result.rows.forEach(r=>{
        doc.text(`Área: ${r.area}`)
        doc.text(`Sesiones: ${r.sesiones}`)
        doc.text(`Total: $${r.total}`)
        doc.moveDown()
    })

    doc.end()

})