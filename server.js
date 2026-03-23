const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const especialidadesRoutes = require("./routes/especialidades.routes");
const profesionalesRoutes = require("./routes/profesionales.routes");
const pacientesRoutes = require("./routes/pacientes.routes");
const sesionesRoutes = require("./routes/sesiones.routes");
const resumenRoutes = require("./routes/resumen.routes");
const observacionesRoutes = require("./routes/observaciones.routes");
const informesRoutes = require("./routes/informes.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/sesiones", sesionesRoutes);
app.use("/api/resumen", resumenRoutes);
app.use("/api/observaciones", observacionesRoutes);
app.use("/api/informes", informesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});