-- ============================================================================
-- MIRAVIA | Base de datos compatible con las API reales del sistema
-- Base usada por: api/auth.php, registrar.php, hoteles.php, restaurantes.php,
-- resenas.php, establecimientos.php, admin-lugares.php, destino.php y
-- comisiones.php.
--
-- Esta instalación NO elimina tablas ni datos existentes. La base se llama
-- exactamente miraviaDB porque ese es el nombre usado en api/db.php.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS miraviaDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE miraviaDB;

CREATE TABLE IF NOT EXISTS roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(190) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
    INDEX idx_usuarios_rol (rol_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS estados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    capital VARCHAR(100) NULL,
    descripcion TEXT NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS municipios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_municipios_estado FOREIGN KEY (estado_id)
        REFERENCES estados(id) ON DELETE CASCADE,
    UNIQUE KEY uq_municipio_estado (estado_id, nombre)
) ENGINE=InnoDB;

-- Hoteles, restaurantes y lugares turísticos administrables.
CREATE TABLE IF NOT EXISTS establecimientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id INT UNSIGNED NOT NULL,
    estado_id INT UNSIGNED NOT NULL,
    municipio_id INT UNSIGNED NULL,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL,
    tipo VARCHAR(80) NOT NULL,
    descripcion TEXT NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(150) NULL,
    sitio_web VARCHAR(255) NULL,
    lat DECIMAL(9,6) NULL,
    lng DECIMAL(9,6) NULL,
    precio_desde DECIMAL(10,2) NULL,
    calificacion_promedio DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    prioridad_manual TINYINT(1) NOT NULL DEFAULT 0,
    comision_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_establecimientos_propietario FOREIGN KEY (propietario_id)
        REFERENCES usuarios(id),
    CONSTRAINT fk_establecimientos_estado FOREIGN KEY (estado_id)
        REFERENCES estados(id),
    CONSTRAINT fk_establecimientos_municipio FOREIGN KEY (municipio_id)
        REFERENCES municipios(id),
    UNIQUE KEY uq_establecimientos_slug (slug),
    INDEX idx_establecimientos_busqueda (tipo, activo, estado_id, municipio_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    precio_total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_reservaciones_establecimiento FOREIGN KEY (establecimiento_id)
        REFERENCES establecimientos(id),
    INDEX idx_reservaciones_usuario (usuario_id),
    INDEX idx_reservaciones_establecimiento (establecimiento_id),
    INDEX idx_reservaciones_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resenas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL,
    comentario TEXT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resenas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_resenas_establecimiento FOREIGN KEY (establecimiento_id)
        REFERENCES establecimientos(id) ON DELETE CASCADE,
    CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5),
    INDEX idx_resenas_establecimiento_fecha (establecimiento_id, creado_en)
) ENGINE=InnoDB;

-- Estas tres tablas mantienen la compatibilidad con api/destino.php.
CREATE TABLE IF NOT EXISTS atracciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_atracciones_estado FOREIGN KEY (estado_id)
        REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hoteles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(80) NULL,
    precio DECIMAL(10,2) NULL,
    calificacion DECIMAL(3,2) NULL,
    ubicacion VARCHAR(180) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_hoteles_estado FOREIGN KEY (estado_id)
        REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS restaurantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    estado_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(80) NULL,
    precio DECIMAL(10,2) NULL,
    calificacion DECIMAL(3,2) NULL,
    ubicacion VARCHAR(180) NULL,
    descripcion TEXT NULL,
    CONSTRAINT fk_restaurantes_estado FOREIGN KEY (estado_id)
        REFERENCES estados(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Módulo que usa api/comisiones.php.
CREATE TABLE IF NOT EXISTS comisiones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reservacion_id INT UNSIGNED NOT NULL,
    establecimiento_id INT UNSIGNED NOT NULL,
    propietario_id INT UNSIGNED NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    monto_comision DECIMAL(10,2) NOT NULL,
    monto_propietario DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','cobrada','cancelada') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cobrada_en TIMESTAMP NULL,
    CONSTRAINT fk_comisiones_reservacion FOREIGN KEY (reservacion_id)
        REFERENCES reservaciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_comisiones_establecimiento FOREIGN KEY (establecimiento_id)
        REFERENCES establecimientos(id),
    CONSTRAINT fk_comisiones_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    UNIQUE KEY uq_comision_reservacion (reservacion_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagos_comision (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id INT UNSIGNED NOT NULL,
    comision_id INT UNSIGNED NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NULL,
    referencia VARCHAR(100) NULL,
    estado ENUM('pendiente','pagado','vencido','cancelado') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pagado_en TIMESTAMP NULL,
    CONSTRAINT fk_pagos_propietario FOREIGN KEY (propietario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_pagos_comision FOREIGN KEY (comision_id)
        REFERENCES comisiones(id) ON DELETE CASCADE,
    UNIQUE KEY uq_pago_comision (comision_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_comision_establecimiento (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    establecimiento_id INT UNSIGNED NOT NULL,
    porcentaje_anterior DECIMAL(5,2) NOT NULL,
    porcentaje_nuevo DECIMAL(5,2) NOT NULL,
    cambiado_por INT UNSIGNED NOT NULL,
    motivo VARCHAR(255) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_establecimiento FOREIGN KEY (establecimiento_id)
        REFERENCES establecimientos(id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (cambiado_por) REFERENCES usuarios(id)
) ENGINE=InnoDB;

INSERT INTO roles (id, nombre, descripcion) VALUES
    (1, 'admin', 'Administración completa del proyecto'),
    (2, 'propietario', 'Administración de establecimientos propios'),
    (3, 'usuario', 'Consulta y planificación de viajes')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Cuentas iniciales. Contraseña: password. Cámbiala al iniciar el sistema.
INSERT INTO usuarios (rol_id, nombre, correo, contrasena) VALUES
    (1, 'Administrador MIRAVIA', 'admin@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro7pY2gNw2cJ8D5c7xQ0cK7W'),
    (3, 'Usuario de prueba', 'usuario@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro7pY2gNw2cJ8D5c7xQ0cK7W'),
    (2, 'Propietario de prueba', 'propietario@miravia.mx', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro7pY2gNw2cJ8D5c7xQ0cK7W')
ON DUPLICATE KEY UPDATE correo = VALUES(correo);

-- Catálogo de estados para el selector y el mapa.
INSERT INTO estados (slug, nombre, capital, lat, lng) VALUES
('aguascalientes','Aguascalientes','Aguascalientes',21.882340,-102.282590),
('baja-california','Baja California','Mexicali',30.840630,-115.283760),
('baja-california-sur','Baja California Sur','La Paz',26.044440,-111.666070),
('campeche','Campeche','Campeche',19.830130,-90.534910),
('chiapas','Chiapas','Tuxtla Gutiérrez',16.756930,-93.129240),
('chihuahua','Chihuahua','Chihuahua',28.632996,-106.069100),
('ciudad-de-mexico','Ciudad de México','Ciudad de México',19.432608,-99.133209),
('coahuila','Coahuila','Saltillo',25.438323,-100.973667),
('colima','Colima','Colima',19.245234,-103.724086),
('durango','Durango','Durango',24.027720,-104.653175),
('guanajuato','Guanajuato','Guanajuato',21.019015,-101.257359),
('guerrero','Guerrero','Chilpancingo',17.551530,-99.500310),
('hidalgo','Hidalgo','Pachuca',20.101060,-98.759130),
('jalisco','Jalisco','Guadalajara',20.659699,-103.349609),
('mexico','Estado de México','Toluca',19.282610,-99.655670),
('michoacan','Michoacán','Morelia',19.566520,-101.706830),
('morelos','Morelos','Cuernavaca',18.924210,-99.221560),
('nayarit','Nayarit','Tepic',21.508510,-104.895690),
('nuevo-leon','Nuevo León','Monterrey',25.686610,-100.316110),
('oaxaca','Oaxaca','Oaxaca de Juárez',17.073180,-96.726590),
('puebla','Puebla','Puebla',19.041440,-98.206270),
('queretaro','Querétaro','Querétaro',20.588790,-100.389890),
('quintana-roo','Quintana Roo','Chetumal',18.500120,-88.296140),
('san-luis-potosi','San Luis Potosí','San Luis Potosí',22.156470,-100.985540),
('sinaloa','Sinaloa','Culiacán',24.809060,-107.394010),
('sonora','Sonora','Hermosillo',29.072970,-110.955920),
('tabasco','Tabasco','Villahermosa',17.989460,-92.947510),
('tamaulipas','Tamaulipas','Ciudad Victoria',23.736920,-99.141120),
('tlaxcala','Tlaxcala','Tlaxcala',19.313890,-98.240440),
('veracruz','Veracruz','Xalapa',19.543780,-96.910180),
('yucatan','Yucatán','Mérida',20.967370,-89.592590),
('zacatecas','Zacatecas','Zacatecas',22.770920,-102.583250)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), capital = VALUES(capital), lat = VALUES(lat), lng = VALUES(lng), activo = 1;

-- Datos de demostración de Oaxaca, guardados en las mismas tablas que usan las API.
INSERT INTO municipios (estado_id, nombre, descripcion)
SELECT e.id, x.nombre, x.descripcion
FROM estados e
JOIN (
    SELECT 'Oaxaca de Juárez' AS nombre, 'Capital cultural de Oaxaca.' AS descripcion
    UNION ALL SELECT 'Santa María Huatulco', 'Playas y bahías del Pacífico.'
    UNION ALL SELECT 'San Pedro Mixtepec', 'Destino de playa de Puerto Escondido.'
    UNION ALL SELECT 'San Pablo Villa de Mitla', 'Zona arqueológica y tradición textil.'
    UNION ALL SELECT 'Santa María del Tule', 'Hogar del Árbol del Tule.'
) AS x
WHERE e.slug = 'oaxaca'
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO establecimientos
    (propietario_id, estado_id, municipio_id, nombre, slug, tipo, descripcion, direccion,
     telefono, correo, precio_desde, calificacion_promedio, prioridad_manual, comision_porcentaje, activo)
SELECT u.id, e.id, m.id, d.nombre, d.slug, d.tipo, d.descripcion, d.direccion,
       d.telefono, d.correo, d.precio_desde, d.calificacion_promedio, d.prioridad_manual, 8.00, 1
FROM (
    SELECT 'Hotel Oaxaca Centro' AS nombre, 'hotel-oaxaca-centro' AS slug, 'hotel' AS tipo,
           'Hospedaje céntrico para descubrir Oaxaca a tu ritmo.' AS descripcion,
           'Centro, Oaxaca de Juárez' AS direccion, '9510000001' AS telefono,
           'hotel.oaxaca@miravia.mx' AS correo, 1450.00 AS precio_desde, 4.50 AS calificacion_promedio,
           1 AS prioridad_manual, 'Oaxaca de Juárez' AS municipio
    UNION ALL SELECT 'Sabores de Oaxaca', 'sabores-de-oaxaca', 'restaurante',
           'Cocina oaxaqueña con ingredientes locales.', 'Centro, Oaxaca de Juárez', '9510000002',
           'sabores@miravia.mx', 220.00, 4.70, 0, 'Oaxaca de Juárez'
    UNION ALL SELECT 'Casa Mitla', 'casa-mitla', 'hotel',
           'Estancia tranquila cerca de la zona arqueológica.', 'San Pablo Villa de Mitla', '9510000003',
           'mitla@miravia.mx', 1100.00, 4.30, 0, 'San Pablo Villa de Mitla'
    UNION ALL SELECT 'Mar y Sol Huatulco', 'mar-y-sol-huatulco', 'restaurante',
           'Mariscos y cocina regional frente al mar.', 'Bahías de Huatulco', '9580000004',
           'mar@miravia.mx', 280.00, 4.60, 0, 'Santa María Huatulco'
) AS d
JOIN usuarios u ON u.correo = 'propietario@miravia.mx'
JOIN estados e ON e.slug = 'oaxaca'
JOIN municipios m ON m.estado_id = e.id AND m.nombre = d.municipio
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), tipo = VALUES(tipo), descripcion = VALUES(descripcion),
    direccion = VALUES(direccion), precio_desde = VALUES(precio_desde), activo = 1;

INSERT INTO atracciones (estado_id, nombre, tipo, descripcion)
SELECT e.id, d.nombre, d.tipo, d.descripcion
FROM estados e
JOIN (
    SELECT 'Monte Albán' AS nombre, 'Zona arqueológica' AS tipo, 'Sitio zapoteca con vistas panorámicas.' AS descripcion
    UNION ALL SELECT 'Templo de Santo Domingo', 'Cultural', 'Conjunto histórico emblemático de Oaxaca.'
    UNION ALL SELECT 'Mercado Benito Juárez', 'Gastronómico', 'Mercado tradicional con sabores y artesanías.'
) AS d
WHERE e.slug = 'oaxaca'
  AND NOT EXISTS (
      SELECT 1 FROM atracciones a WHERE a.estado_id = e.id AND a.nombre = d.nombre
  );

INSERT INTO hoteles (estado_id, nombre, categoria, precio, calificacion, ubicacion, descripcion)
SELECT e.id, 'Hotel Oaxaca Centro', 'Hotel', 1450.00, 4.50, 'Oaxaca de Juárez',
       'Hospedaje céntrico para descubrir Oaxaca a tu ritmo.'
FROM estados e
WHERE e.slug = 'oaxaca'
  AND NOT EXISTS (SELECT 1 FROM hoteles h WHERE h.estado_id = e.id AND h.nombre = 'Hotel Oaxaca Centro');

INSERT INTO restaurantes (estado_id, nombre, tipo, precio, calificacion, ubicacion, descripcion)
SELECT e.id, 'Sabores de Oaxaca', 'Cocina oaxaqueña', 220.00, 4.70, 'Oaxaca de Juárez',
       'Cocina oaxaqueña con ingredientes locales.'
FROM estados e
WHERE e.slug = 'oaxaca'
  AND NOT EXISTS (SELECT 1 FROM restaurantes r WHERE r.estado_id = e.id AND r.nombre = 'Sabores de Oaxaca');

DROP TRIGGER IF EXISTS trg_reservacion_completada;
DELIMITER $$
CREATE TRIGGER trg_reservacion_completada
AFTER UPDATE ON reservaciones
FOR EACH ROW
BEGIN
    IF NEW.estado = 'completada' AND OLD.estado <> 'completada' THEN
        INSERT INTO comisiones (
            reservacion_id, establecimiento_id, propietario_id, monto_base, porcentaje,
            monto_comision, monto_propietario, estado
        )
        SELECT NEW.id, NEW.establecimiento_id, e.propietario_id, NEW.precio_total,
               e.comision_porcentaje,
               ROUND(NEW.precio_total * (e.comision_porcentaje / 100), 2),
               ROUND(NEW.precio_total - (NEW.precio_total * (e.comision_porcentaje / 100)), 2),
               'pendiente'
        FROM establecimientos e
        WHERE e.id = NEW.establecimiento_id
        ON DUPLICATE KEY UPDATE monto_base = VALUES(monto_base), porcentaje = VALUES(porcentaje),
            monto_comision = VALUES(monto_comision), monto_propietario = VALUES(monto_propietario);
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_historial_comision;
DELIMITER $$
CREATE TRIGGER trg_historial_comision
AFTER UPDATE ON establecimientos
FOR EACH ROW
BEGIN
    IF NEW.comision_porcentaje <> OLD.comision_porcentaje THEN
        INSERT INTO historial_comision_establecimiento (
            establecimiento_id, porcentaje_anterior, porcentaje_nuevo, cambiado_por, motivo
        ) VALUES (
            NEW.id, OLD.comision_porcentaje, NEW.comision_porcentaje, NEW.propietario_id,
            'Cambio de comisión'
        );
    END IF;
END$$
DELIMITER ;

CREATE OR REPLACE VIEW vw_comisiones_propietario AS
SELECT u.id AS propietario_id, u.nombre AS propietario, e.id AS establecimiento_id,
       e.nombre AS establecimiento, e.tipo, COUNT(c.id) AS total_reservaciones,
       SUM(c.monto_base) AS total_facturado, SUM(c.monto_comision) AS total_comision,
       SUM(c.monto_propietario) AS total_neto,
       SUM(CASE WHEN c.estado = 'pendiente' THEN c.monto_comision ELSE 0 END) AS comision_pendiente,
       SUM(CASE WHEN c.estado = 'cobrada' THEN c.monto_comision ELSE 0 END) AS comision_cobrada
FROM comisiones c
JOIN usuarios u ON u.id = c.propietario_id
JOIN establecimientos e ON e.id = c.establecimiento_id
GROUP BY u.id, u.nombre, e.id, e.nombre, e.tipo;

CREATE OR REPLACE VIEW vw_estado_cuenta_propietario AS
SELECT c.propietario_id, u.nombre AS propietario, COUNT(c.id) AS total_comisiones,
       SUM(c.monto_comision) AS total_a_cobrar,
       SUM(CASE WHEN c.estado = 'cobrada' THEN c.monto_comision ELSE 0 END) AS total_cobrado,
       SUM(CASE WHEN c.estado = 'pendiente' THEN c.monto_comision ELSE 0 END) AS saldo_pendiente
FROM comisiones c
JOIN usuarios u ON u.id = c.propietario_id
GROUP BY c.propietario_id, u.nombre;

-- Verificación rápida después de importar:
-- SELECT COUNT(*) AS establecimientos_oaxaca FROM establecimientos e
-- JOIN estados s ON s.id = e.estado_id WHERE s.slug = 'oaxaca';
