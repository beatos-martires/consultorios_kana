require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function crearUsuario() {
  try {
    const result = await pool.query(`
      INSERT INTO usuarios (nombre, dni, rol, telefono, email, activo)
      VALUES ('Secretaría General', '11111111', 'secretaria', '3825000000', 'secretaria@kana.com', TRUE)
      ON CONFLICT (dni) DO NOTHING
      RETURNING *;
    `);

    if (result.rows.length > 0) {
      console.log("Usuario creado correctamente:");
      console.log(result.rows[0]);
    } else {
      console.log("El usuario ya existía y no fue necesario crearlo.");
    }
  } catch (error) {
    console.error("Error al crear usuario:", error);
  } finally {
    await pool.end();
  }
}

crearUsuario();