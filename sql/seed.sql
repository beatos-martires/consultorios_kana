INSERT INTO areas (nombre) VALUES
('Terapia Ocupacional'),
('Psicología'),
('Acompañamiento Pedagógico'),
('Educación Especial');

INSERT INTO usuarios (nombre_completo, dni, rol, telefono, email)
VALUES
('Secretaría General', '11111111', 'secretaria', '3825123456', 'secretaria@centro.com');

INSERT INTO usuarios (nombre_completo, dni, rol, area_id, telefono, email)
VALUES
('Lic. Ana Pérez', '22222222', 'profesional', 2, '3825123001', 'ana@centro.com'),
('Prof. Laura Díaz', '33333333', 'profesional', 3, '3825123002', 'laura@centro.com');

INSERT INTO usuarios (nombre_completo, dni, rol, telefono, email)
VALUES
('María Gómez', '44444444', 'tutor', '3825123999', 'maria@familia.com');

INSERT INTO pacientes (
  nombre_completo,
  dni,
  fecha_nacimiento,
  edad,
  obra_social,
  observaciones,
  cud_tiene,
  cud_pdf_url,
  cud_vencimiento
)
VALUES
(
  'Tomás Gómez',
  '55555555',
  '2017-04-10',
  8,
  'OSDE',
  'Primera entrevista',
  false,
  null,
  null
);

INSERT INTO paciente_tutores (paciente_id, tutor_id, parentesco)
VALUES
(1, 4, 'Madre');

INSERT INTO paciente_profesionales (paciente_id, profesional_id, area_id)
VALUES
(1, 2, 2),
(1, 3, 3);

INSERT INTO sesiones (
  paciente_id,
  profesional_id,
  area_id,
  fecha,
  cantidad,
  monto_unitario,
  observaciones,
  cargado_por
)
VALUES
(1, 2, 2, '2026-03-01', 1, 15000, 'Sesión inicial', 1),
(1, 3, 3, '2026-03-03', 1, 12000, 'Apoyo pedagógico', 1);

INSERT INTO pagos_mensuales (
  paciente_id, anio, mes, total_calculado, monto_pagado, estado, observaciones
)
VALUES
(1, 2026, 3, 27000, 0, 'pendiente', 'Mes inicial');

INSERT INTO turnos (
  paciente_id, profesional_id, area_id, fecha, hora, estado, motivo, observaciones, creado_por
)
VALUES
(1, 2, 2, '2026-03-20', '10:00', 'confirmado', 'Seguimiento psicológico', 'Turno de control', 1),
(1, 3, 3, '2026-03-21', '11:30', 'pendiente', 'Apoyo pedagógico', 'Primera evaluación pedagógica', 1);