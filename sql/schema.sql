DROP TABLE IF EXISTS turnos CASCADE;
DROP TABLE IF EXISTS pagos_mensuales CASCADE;
DROP TABLE IF EXISTS evoluciones_clinicas CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS paciente_profesionales CASCADE;
DROP TABLE IF EXISTS paciente_tutores CASCADE;
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
    dni VARCHAR(20),
    fecha_nacimiento DATE,
    edad INTEGER,
    obra_social VARCHAR(120),
    observaciones TEXT,
    cud_tiene BOOLEAN DEFAULT FALSE,
    cud_pdf_url TEXT,
    cud_vencimiento DATE,
    fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE paciente_tutores (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tutor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    parentesco VARCHAR(50),
    UNIQUE (paciente_id, tutor_id)
);

CREATE TABLE paciente_profesionales (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profesional_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    area_id INTEGER NOT NULL REFERENCES areas(id),
    UNIQUE (paciente_id, profesional_id, area_id)
);

CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profesional_id INTEGER REFERENCES usuarios(id),
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
    area_id INTEGER NOT NULL REFERENCES areas(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT NOT NULL
);

CREATE TABLE pagos_mensuales (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    total_calculado NUMERIC(10,2) NOT NULL DEFAULT 0,
    monto_pagado NUMERIC(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'parcial', 'pagado')) DEFAULT 'pendiente',
    observaciones TEXT,
    UNIQUE (paciente_id, anio, mes)
);

CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profesional_id INTEGER REFERENCES usuarios(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'realizado', 'cancelado')),
    motivo TEXT,
    observaciones TEXT,
    creado_por INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);