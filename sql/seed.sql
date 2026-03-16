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
  edad,
  dni,
  obra_social,
  area_id,
  grupo_familiar,
  observaciones,
  tutor_id
)
VALUES
(
  'Tomás Gómez',
  8,
  '55555555',
  'OSDE',
  2,
  'Convive con madre y padre',
  'Primera entrevista',
  4
);