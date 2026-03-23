INSERT INTO usuarios (nombre, dni, rol, telefono, email, activo)
VALUES ('Secretaría General', '11111111', 'secretaria', '3825000000', 'secretaria@kana.com', TRUE);

INSERT INTO usuarios (nombre, dni, rol, telefono, email, activo) VALUES
('Secretaría General', '11111111', 'secretaria', '3825000000', 'secretaria@kana.com', TRUE),
('Lic. Ana Pérez', '22222222', 'profesional', '3825111111', 'ana@kana.com', TRUE),
('Lic. Laura Díaz', '33333333', 'profesional', '3825222222', 'laura@kana.com', TRUE),
('María Gómez', '44444444', 'tutor', '3825333333', 'maria@kana.com', TRUE),
('Pedro López', '55555555', 'tutor', '3825444444', 'pedro@kana.com', TRUE);

INSERT INTO especialidades (nombre, precio_sesion) VALUES
('Psicología', 12000),
('Fonoaudiología', 10000),
('Terapia Ocupacional', 11000);

INSERT INTO profesionales (usuario_id, especialidad_id)
SELECT u.id, e.id
FROM usuarios u, especialidades e
WHERE u.dni = '22222222' AND e.nombre = 'Psicología';

INSERT INTO profesionales (usuario_id, especialidad_id)
SELECT u.id, e.id
FROM usuarios u, especialidades e
WHERE u.dni = '33333333' AND e.nombre = 'Fonoaudiología';

INSERT INTO pacientes (nombre, dni, fecha_nacimiento, tutor_usuario_id)
SELECT 'Juan Pérez', '66666666', '2016-05-10', u.id
FROM usuarios u
WHERE u.dni = '44444444';

INSERT INTO pacientes (nombre, dni, fecha_nacimiento, tutor_usuario_id)
SELECT 'Lucía López', '77777777', '2015-08-21', u.id
FROM usuarios u
WHERE u.dni = '55555555';