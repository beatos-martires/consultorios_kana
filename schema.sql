DROP TABLE IF EXISTS informes CASCADE;
DROP TABLE IF EXISTS observaciones CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS profesionales CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('secretaria', 'profesional', 'tutor')),
    telefono VARCHAR(30),
    email VARCHAR(150),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    precio_sesion NUMERIC(12,2) NOT NULL CHECK (precio_sesion >= 0)
);

CREATE TABLE profesionales (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    tutor_usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    cud_nombre_original VARCHAR(255),
    cud_nombre_guardado VARCHAR(255),
    cud_ruta VARCHAR(500),
    cud_mime VARCHAR(120),
    cud_size BIGINT
);

CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    profesional_id INTEGER NOT NULL REFERENCES profesionales(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    especialidad_id INTEGER NOT NULL REFERENCES especialidades(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    mes VARCHAR(20) NOT NULL,
    anio INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE observaciones (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    profesional_id INTEGER NOT NULL REFERENCES profesionales(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    observacion TEXT NOT NULL
);

CREATE TABLE informes (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    profesional_id INTEGER NOT NULL REFERENCES profesionales(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    nombre_original VARCHAR(255) NOT NULL,
    nombre_guardado VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    mime VARCHAR(120) NOT NULL,
    size BIGINT NOT NULL
);

CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_pacientes_tutor_usuario ON pacientes(tutor_usuario_id);
CREATE INDEX idx_sesiones_mes_anio ON sesiones(mes, anio);
CREATE INDEX idx_observaciones_paciente ON observaciones(paciente_id);
CREATE INDEX idx_observaciones_profesional ON observaciones(profesional_id);
CREATE INDEX idx_informes_paciente ON informes(paciente_id);
CREATE INDEX idx_informes_profesional ON informes(profesional_id);