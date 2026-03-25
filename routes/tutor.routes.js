router.get("/tutor/pacientes/:tutorId", async (req, res) => {
  const { tutorId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.nombre,
        p.dni,
        p.fecha_nacimiento,
        p.tutor_usuario_id,
        p.cud_ruta
      FROM pacientes p
      WHERE p.tutor_usuario_id = $1
      ORDER BY p.nombre
      `,
      [tutorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pacientes del tutor:", error);
    res.status(500).json({ error: "Error al obtener pacientes del tutor" });
  }
});