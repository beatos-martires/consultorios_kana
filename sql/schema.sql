DROP TABLE IF EXISTS evoluciones_clinicas CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('secretaria', 'profesional', 'tutor')),
    area_id INTEGER REFERENCES areas(id),
    telefono VARCHAR(50),
    email VARCHAR(120),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    edad INTEGER,
    dni VARCHAR(20),
    obra_social VARCHAR(120),
    area_id INTEGER REFERENCES areas(id),
    grupo_familiar TEXT,
    observaciones TEXT,
    tutor_id INTEGER REFERENCES usuarios(id),
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id),
    fecha DATE NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    monto_unitario NUMERIC(10,2) NOT NULL,
    observaciones TEXT,
    cargado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evoluciones_clinicas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profesional_id INTEGER NOT NULL REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT NOT NULL
);