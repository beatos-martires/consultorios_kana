const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/areas", require("./routes/areas.routes"));
app.use("/api/usuarios", require("./routes/usuarios.routes"));
app.use("/api/pacientes", require("./routes/pacientes.routes"));
app.use("/api/sesiones", require("./routes/sesiones.routes"));
app.use("/api/evoluciones", require("./routes/evoluciones.routes"));
app.use("/api/pagos", require("./routes/pagos.routes"));
app.use("/api/alertas", require("./routes/alertas.routes"));
app.use("/api/historial", require("./routes/historial.routes"));

app.get("/api", (req, res) => {
  res.json({ mensaje: "API funcionando correctamente" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});